from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from base64 import b64encode
from sqlmodel import Session, select, desc
from typing import List

from .auth import verify_password, create_access_token, get_password_hash, get_current_user

from .database import create_db_and_tables, get_session
from .models import Project, About, CreativeItem, ContactForm, User, LifePost



import os
import resend
import httpx
import shutil
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")



@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)


origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
def create_project(project: Project, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: int, updated_project: Project, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
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
def update_about(updated_about: About, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    db_about  = session.exec(select(About)).first()
    if not db_about:
        raise HTTPException(status_code=404, detail="About data not found")
    
    about_data = updated_about.model_dump(exclude_unset=True)
    for key, value in about_data.items():
        setattr(db_about, key, value)

    session.add(db_about)
    session.commit()
    session.refresh(db_about)
    return db_about

@app.post("/api/contact")
async def handle_contact(form_data: ContactForm):
    try:
        email = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": "christiancarlsonwork@gmail.com",
            "subject": f"New Message from {form_data.name}",
            "html": f"""
                <h3>New Portfolio Message</h3>
                <p><strong>From:</strong> {form_data.name} ({form_data.email})</p>
                <p><strong>Message:</strong></p>
                <p>{form_data.message}</p>
            """,
        })
        return {"status": "success", "id": email["id"]}

    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/life", response_model=List[LifePost])
def get_life_posts(session: Session = Depends(get_session)):
    statement = select(LifePost).order_by(desc(LifePost.created_at))
    return session.exec(statement).all()


@app.post("/api/life")
async def create_life_post(
    title: str = Form(...),
    caption: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    file_path = f"uploads/{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file,buffer)
    
    db_url = f"http://localhost:8000/{file_path}"

    new_post = LifePost(
        title=title,
        caption=caption,
        category=category,
        image_url=db_url
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
    
    session.delete(db_post)
    session.commit()
    return{"status": "Post deleted"}


@app.post("/api/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/status/github")
async def get_github_status():
    username = "Javin2005"
    url = f"https://api.github.com/users/{username}/events"
    
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                return {"active": False}

            events = response.json()
            if not isinstance(events, list):
                return {"active": False}


            push_event = next((e for e in events if e.get("type") == "PushEvent"), None)

            if push_event:
                repo_full_name = push_event.get("repo", {}).get("name", "unknown/repo")
                repo_name = repo_full_name.split("/")[-1]
                
                payload = push_event.get("payload", {})
                commits = payload.get("commits", [])
                
                if commits and len(commits) > 0:
                    commit_msg = commits[0].get("message", "Updated files")
                else:
                    ref = payload.get("ref", "main").split("/")[-1]
                    commit_msg = f"Pushed to {ref}"

                return {
                    "repo": repo_name,
                    "message": commit_msg,
                    "active": True
                }
        except Exception:
            pass
            
    return {"active": False}


@app.get("/api/status/spotify")
async def get_spotify_status():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    refresh_token = os.getenv("SPOTIFY_REFRESH_TOKEN")


    if not all([client_id, client_secret, refresh_token]):
        return {"active": False}

    async with httpx.AsyncClient() as client:
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

            playback_url = "https://api.spotify.com/v1/me/player/currently-playing"
            headers = {"Authorization": f"Bearer {access_token}"}

            resp = await client.get(playback_url, headers=headers)

            if resp.status_code == 204:
                return {"active": False, "message": "Nothing playing"}
            
            data = resp.json()
            if data.get("is_playing"):
                return {
                    "active": True,
                    "track": data["item"] ["name"],
                    "artist": data["item"] ["artists"] [0] ["name"],
                    "link": data["item"] ["external_urls"] ["spotify"]
                }
        except Exception as e:
            print(f"Spotify API Error: {e}")
    return {"active": False}
