from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from base64 import b64encode
from sqlmodel import Session, select, desc
from typing import List

import html
import re
import time
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .auth import verify_password, create_access_token, get_current_user

from .database import create_db_and_tables, get_session
from .models import Project, About, CreativeItem, ContactForm, User, LifePost
from .schemas import AboutUpdate, ProjectCreate, ProjectUpdate

import cloudinary
import cloudinary.uploader


import os
import resend
import httpx
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
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
    "https://javincarlson.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"status": "Database Online", "student": "LTH"}


@app.get("/api/projects", response_model=List[Project])
def get_all_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    return projects


@app.get("/api/projects/featured", response_model=List[Project])
def get_featured_projects(session: Session = Depends(get_session)):
    statement = select(Project).where(Project.featured == True)
    projects = session.exec(statement).all()
    return projects


@app.post("/api/projects", response_model=Project)
def create_project(data: ProjectCreate, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    project = Project(**data.model_dump())
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: int, updated_project: ProjectUpdate, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    db_project = session.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_data = updated_project.model_dump(exclude_unset=True)
    for key, value in project_data.items():
        setattr(db_project, key, value)

    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    db_project = session.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(db_project)
    session.commit()
    return {"status": "Project deleted"}

@app.get("/api/about", response_model=About)
def get_about(session: Session = Depends(get_session)):
    statement = select(About)
    about = session.exec(statement).first()
    if not about:
        raise HTTPException(status_code=404, detail="About data not found")
    return about

@app.put("/api/about", response_model=About)
def update_about(
    updated_about: AboutUpdate,
    session: Session = Depends(get_session), 
    admin: str = Depends(get_current_user)
):
    db_about = session.exec(select(About)).first()
    if not db_about:
        raise HTTPException(status_code=404, detail="About data not found")
    


    about_data = updated_about.model_dump()
    

    for key, value in about_data.items():
        setattr(db_about, key, value)
        
    session.add(db_about)
    session.commit()
    session.refresh(db_about)
    return db_about


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


@app.get("/api/creative", response_model=List[CreativeItem])
def get_creative(session: Session = Depends(get_session)):
    items = session.exec(select(CreativeItem)).all()
    return items

@app.get("/api/life", response_model=List[LifePost])
def get_life_posts(session: Session = Depends(get_session)):
    statement = select(LifePost).order_by(desc(LifePost.created_at))
    return session.exec(statement).all()


MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


def cloudinary_public_id(url: str):
    """Recover Cloudinary's id for an image from its URL so it can be deleted.

    e.g. https://res.cloudinary.com/<cloud>/image/upload/v1712/abc123.jpg -> "abc123"
    Returns None for images not hosted on Cloudinary (like the seeded Unsplash ones).
    """
    marker = "/image/upload/"
    if "res.cloudinary.com" not in url or marker not in url:
        return None
    parts = url.split(marker, 1)[1].split("/")
    if parts and re.fullmatch(r"v\d+", parts[0]):
        parts = parts[1:]
    return "/".join(parts).rsplit(".", 1)[0] or None


@app.post("/api/life", response_model=LifePost)
async def create_life_post(
    title: str = Form(..., min_length=1, max_length=200),
    caption: str = Form(..., max_length=2000),
    category: str = Form(..., max_length=50),
    image: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await image.read(MAX_IMAGE_BYTES + 1)
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is larger than 10 MB")

    try:
        # The Cloudinary SDK is blocking; run it in a thread so the server
        # can keep answering other requests while the upload happens.
        upload_result = await run_in_threadpool(
            cloudinary.uploader.upload, contents, resource_type="image"
        )
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=502, detail="Image upload failed")

    new_post = LifePost(
        title=title,
        caption=caption,
        category=category,
        image_url=upload_result["secure_url"],
    )
    session.add(new_post)
    session.commit()
    session.refresh(new_post)
    return new_post


@app.delete("/api/life/{post_id}")
def delete_life_post(post_id: int, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    db_post = session.get(LifePost, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Also remove the file from Cloudinary, otherwise it keeps using your free quota.
    public_id = cloudinary_public_id(db_post.image_url)
    if public_id:
        try:
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Cloudinary delete failed for {public_id}: {e}")

    session.delete(db_post)
    session.commit()
    return {"status": "Post deleted"}


@app.post("/api/token")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# Every visitor's status bar asks for GitHub/Spotify status every 30 seconds.
# Without a cache, 10 visitors = 40+ GitHub API calls per minute, which hits
# GitHub's rate limit fast. We remember the last answer for a short while instead.
_status_cache: dict = {}


def cached(key: str, max_age: float):
    hit = _status_cache.get(key)
    if hit and time.monotonic() - hit[0] < max_age:
        return hit[1]
    return None


def remember(key: str, value: dict) -> dict:
    _status_cache[key] = (time.monotonic(), value)
    return value


@app.get("/api/status/github")
async def get_github_status():
    hit = cached("github", 300)
    if hit is not None:
        return hit
    return remember("github", await _fetch_github_status())


async def _fetch_github_status():
    username = "Javin2005"
    token = os.getenv("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "javincarlson-portfolio",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1. Check recent Events API
            events_res = await client.get(
                f"https://api.github.com/users/{username}/events",
                headers=headers,
            )
            if events_res.status_code == 200:
                events = events_res.json()
                push_event = (
                    next((e for e in events if e.get("type") == "PushEvent"), None)
                    if isinstance(events, list)
                    else None
                )
                if push_event:
                    repo_full_name = push_event.get("repo", {}).get("name", "")
                    repo_name = repo_full_name.split("/")[-1] or "unknown"
                    payload = push_event.get("payload", {})
                    head_sha = payload.get("head")

                    if repo_full_name and head_sha:
                        commit_res = await client.get(
                            f"https://api.github.com/repos/{repo_full_name}/commits/{head_sha}",
                            headers=headers,
                        )
                        if commit_res.status_code == 200:
                            msg = commit_res.json().get("commit", {}).get("message", "")
                            if msg:
                                return {
                                    "repo": repo_name,
                                    "message": msg.splitlines()[0],
                                    "active": True,
                                }

                    ref = payload.get("ref", "main").split("/")[-1]
                    return {
                        "repo": repo_name,
                        "message": f"Pushed to {ref}",
                        "active": True,
                    }
            else:
                print(f"GitHub Events API {events_res.status_code}: {events_res.text}")

            # 2. Fallback if no push events in the last 30 days
            repos_res = await client.get(
                f"https://api.github.com/users/{username}/repos?sort=pushed&per_page=1",
                headers=headers,
            )
            if repos_res.status_code == 200:
                repos = repos_res.json()
                if isinstance(repos, list) and repos:
                    repo_full_name = repos[0]["full_name"]
                    repo_name = repos[0]["name"]
                    commits_res = await client.get(
                        f"https://api.github.com/repos/{repo_full_name}/commits?per_page=1",
                        headers=headers,
                    )
                    if commits_res.status_code == 200:
                        commits = commits_res.json()
                        if isinstance(commits, list) and commits:
                            msg = commits[0].get("commit", {}).get("message", "Updated files")
                            return {
                                "repo": repo_name,
                                "message": msg.splitlines()[0],
                                "active": True,
                            }
        except Exception as e:
            print(f"GitHub API Error: {e}")

    return {"active": False}


@app.get("/api/status/spotify")
async def get_spotify_status():
    hit = cached("spotify", 25)
    if hit is not None:
        return hit
    return remember("spotify", await _fetch_spotify_status())


async def _fetch_spotify_status():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    refresh_token = os.getenv("SPOTIFY_REFRESH_TOKEN")


    if not all([client_id, client_secret, refresh_token]):
        return {"active": False}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            auth_str = f"{client_id}:{client_secret}"
            b64_auth = b64encode(auth_str.encode()).decode()

            token_url = "https://accounts.spotify.com/api/token"
            token_data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            }
            token_headers = {
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            }

            token_res = await client.post(token_url, data=token_data, 
                                          headers=token_headers)
            access_token = token_res.json().get("access_token")
            if not access_token:
                print(f"Spotify token refresh failed: {token_res.status_code}")
                return {"active": False}

            playback_url = "https://api.spotify.com/v1/me/player/currently-playing"
            headers = {"Authorization": f"Bearer {access_token}"}

            resp = await client.get(playback_url, headers=headers)

            if resp.status_code == 204:
                return {"active": False, "message": "Nothing playing"}
            
            if resp.status_code != 200:
                return {"active": False}

            data = resp.json()
            # "item" is null for ads and some podcasts
            if data.get("is_playing") and data.get("item"):
                return {
                    "active": True,
                    "track": data["item"] ["name"],
                    "artist": data["item"] ["artists"] [0] ["name"],
                    "link": data["item"] ["external_urls"] ["spotify"]
                }
        except Exception as e:
            print(f"Spotify API Error: {e}")
    return {"active": False}
