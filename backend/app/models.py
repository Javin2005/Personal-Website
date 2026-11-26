"""Database tables.

Each class with `table=True` is one table; each attribute is one column.
When you add or change a column here, you also need a migration in
backend/migrations/versions/ so the live Postgres database gets the change
(see README "Changing the database").
"""
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field as PydField
from sqlmodel import JSON, Column, Field, SQLModel


class ContactForm(BaseModel):
    name: str = PydField(min_length=1, max_length=100)
    email: EmailStr
    message: str = PydField(min_length=1, max_length=5000)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str


class SiteSettings(SQLModel, table=True):
    """One row holding everything about how the site looks and reads:
    colors, fonts, hero text, section order. Stored as JSON so new settings
    can be added without a database migration. The shape is checked by
    schemas.SettingsData when the admin saves."""
    __tablename__ = "site_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    data: dict = Field(default={}, sa_column=Column(JSON))


class About(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    title: str
    bio: str
    profile_pic: str
    skills: List[str] = Field(default=[], sa_column=Column(JSON))  # unused since the redesign, see SkillGroup
    socials: List[dict] = Field(default=[], sa_column=Column(JSON))


# ---- Ordered collections the admin can add to, edit, hide and reorder ----

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    tech_stack: List[str] = Field(default=[], sa_column=Column(JSON))
    github_url: Optional[str] = None
    featured: bool = False
    category: str
    difficulty: int
    live_url: Optional[str] = None
    media_url: Optional[str] = None  # image or .mp4/.webm video shown with the project
    period: str = ""
    sort_order: int = 0
    visible: bool = True


class Experience(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str
    organisation: str
    location: str = ""
    period: str = ""
    summary: str = ""
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    sort_order: int = 0
    visible: bool = True


class Education(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    school: str
    programme: str
    location: str = ""
    period: str = ""
    notes: str = ""
    courses: List[str] = Field(default=[], sa_column=Column(JSON))
    sort_order: int = 0
    visible: bool = True


class SkillGroup(SQLModel, table=True):
    __tablename__ = "skill_group"
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str  # e.g. "Use most days"
    items: List[str] = Field(default=[], sa_column=Column(JSON))
    sort_order: int = 0
    visible: bool = True


class Interest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str  # e.g. "Books", "Films", "Music"
    title: str
    creator: str = ""
    note: str = ""
    sort_order: int = 0
    visible: bool = True



class ApiKey(SQLModel, table=True):
    """A key that lets a program (like Claude through the MCP server) edit
    the site for you. Only the hash is stored; the key itself is shown once."""
    __tablename__ = "api_key"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    prefix: str  # first characters of the key, so you can tell keys apart
    key_hash: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used_at: Optional[datetime] = None
