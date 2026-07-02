from sqlmodel import SQLModel, Field, JSON, Column
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message:str

class SocialLink(SQLModel):
    platform: str
    url: str

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title:str
    description: str
    tech_stack: List[str] = Field(default=[], sa_column=Column(JSON))
    github_url: Optional[str] = None
    featured: bool = False
    category: str
    difficulty: int

class About(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    title: str
    bio: str
    profile_pic: str
    skills: List[str] = Field(default=[], sa_column=Column(JSON))
    socials: List[dict] = Field(default=[], sa_column=Column(JSON))

class CreativeItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    tech: str
    video_path: str
