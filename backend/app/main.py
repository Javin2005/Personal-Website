"""The FastAPI app: wires everything together.

- content.py   settings, projects, experience, education, skills, interests
- status.py    GitHub / Spotify status line
- auth.py      passwords and login tokens
- this file    app setup, about, contact form, login, media uploads
"""
import html
import os
from contextlib import asynccontextmanager

import cloudinary
import cloudinary.uploader
import resend
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlmodel import Session, select

from .apikeys import router as apikeys_router
from .auth import DUMMY_HASH, create_access_token, get_current_user, verify_password
from .content import collection_routers, ensure_settings_row
from .content import router as content_router
from .database import get_session, run_migrations
from .models import About, ContactForm, User
from .schemas import AboutUpdate
from .status import router as status_router

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts: update the database structure,
    # then make sure the settings row exists.
    run_migrations()
    ensure_settings_row()
    yield

app = FastAPI(lifespan=lifespan)


def client_ip(request: Request) -> str:
    """The visitor's IP address, used as the rate-limit key.

    On Render the app sits behind a proxy, so request.client.host is the
    proxy's IP and every visitor would share ONE rate-limit bucket. The proxy
    appends the real client IP to X-Forwarded-For; we take the last entry
    (the one our proxy added) because earlier entries can be faked by the client.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=client_ip)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:5173",
    "https://christiancarlson.vercel.app",
    "https://www.javincarlson.com",
    "https://javincarlson.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://localhost:\d+",  # any local dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content_router)
for r in collection_routers:
    app.include_router(r)
app.include_router(status_router)
app.include_router(apikeys_router)


@app.get("/")
async def read_root():
    return {"status": "ok"}


# ---------------------------------------------------------------- about

@app.get("/api/about", response_model=About)
def get_about(session: Session = Depends(get_session)):
    about = session.exec(select(About)).first()
    if not about:
        raise HTTPException(status_code=404, detail="About data not found")
    return about


@app.put("/api/about", response_model=About)
def update_about(
    updated_about: AboutUpdate,
    session: Session = Depends(get_session),
    admin: str = Depends(get_current_user),
):
    db_about = session.exec(select(About)).first() or About(**updated_about.model_dump())
    for key, value in updated_about.model_dump().items():
        setattr(db_about, key, value)
    session.add(db_about)
    session.commit()
    session.refresh(db_about)
    return db_about


# ---------------------------------------------------------------- contact

@app.post("/api/contact")
@limiter.limit("3/minute")
async def handle_contact(request: Request, form_data: ContactForm):
    name = html.escape(form_data.name)
    sender = html.escape(form_data.email)
    message = html.escape(form_data.message).replace("\n", "<br>")
    try:
        email = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": "christiancarlsonwork@gmail.com",
            "reply_to": form_data.email,
            "subject": f"New Message from {form_data.name.replace(chr(10), ' ')}",
            "html": f"""
                <h3>New Portfolio Message</h3>
                <p><strong>From:</strong> {name} ({sender})</p>
                <p><strong>Message:</strong></p>
                <p>{message}</p>
            """,
        })
        return {"status": "success", "id": email["id"]}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Could not send message")


# ---------------------------------------------------------------- media uploads

MAX_IMAGE_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_VIDEO_BYTES = 40 * 1024 * 1024   # 40 MB


@app.post("/api/media")
async def upload_media(file: UploadFile = File(...), admin: str = Depends(get_current_user)):
    """Upload an image or video to Cloudinary and return its URL.

    The admin page uses this for project media and the profile picture,
    then saves the returned URL like any other text field.
    """
    content_type = file.content_type or ""
    if content_type.startswith("image/"):
        kind, limit = "image", MAX_IMAGE_BYTES
    elif content_type in ("video/mp4", "video/webm"):
        kind, limit = "video", MAX_VIDEO_BYTES
    else:
        raise HTTPException(status_code=400, detail="Upload an image, or an .mp4/.webm video")

    if file.size is not None and file.size > limit:
        raise HTTPException(status_code=413, detail=f"File is larger than {limit // (1024 * 1024)} MB")

    try:
        # FastAPI keeps big uploads in a temporary file on disk, and we pass
        # that file straight on, so a large video never sits in RAM.
        # The Cloudinary SDK is blocking, so it runs in a thread.
        result = await run_in_threadpool(
            cloudinary.uploader.upload, file.file, resource_type=kind
        )
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload failed")

    return {"url": result["secure_url"], "kind": kind}


# ---------------------------------------------------------------- login

@app.post("/api/token")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()

    # Check a password even when the user doesn't exist, so the response
    # time doesn't reveal which usernames are real.
    password_ok = verify_password(form_data.password, user.hashed_password if user else DUMMY_HASH)
    if not user or not password_ok:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
