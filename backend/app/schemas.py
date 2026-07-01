from pydantic import BaseModel
from typing import List, Optional


class SocialLink(BaseModel):
    platform: str
    url: str
class AboutMe(BaseModel):
    name: str
    title: str
    bio: str
    profile_pic: str 
    skills: List[str]
    socials: List[SocialLink]
class Project(BaseModel):
    id: int
    title: str
    description: str
    tech_stack: List[str] = []
    github_url: str | None = None
    featured: bool
    category: str
    difficulty: int