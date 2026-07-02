from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List


from .database import create_db_and_tables, get_session
from .models import Project, About, CreativeItem



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


@app.get("/api/about", response_model=About)
def get_about(session: Session = Depends(get_session)):
    statement = select(About)
    about = session.exec(statement).first()
    if not about:
        raise HTTPException(status_code=404, detail="About data not found")
    return about


@app.get("/api/creative", response_model=List[CreativeItem])
def get_creative(session: Session = Depends(get_session)):
    items = session.exec(select(CreativeItem)).all()
    return items


