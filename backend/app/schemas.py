"""Shapes of data the API *accepts* from the frontend.

The classes in models.py are database tables. SQLModel does NOT validate
table models when they are used as request bodies, so accepting them directly
lets bad data (missing fields, wrong types, `javascript:` links) reach the
database. These Pydantic models are checked by FastAPI before your endpoint
code runs; invalid input gets an automatic 422 response.
"""
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


def _check_url(value: Optional[str], allow_relative: bool = False) -> Optional[str]:
    """Only allow http(s) links (and optionally site-relative paths like /assets/x.jpg).

    Blocks things like `javascript:alert(1)` which would run code when clicked.
    """
    if value is None or value == "":
        return None
    value = value.strip()
    if value.startswith(("https://", "http://")):
        return value
    if allow_relative and value.startswith("/") and not value.startswith("//"):
        return value
    raise ValueError("must be an http(s) URL")


class SocialLink(BaseModel):
    platform: str = Field(min_length=1, max_length=50)
    url: str = Field(max_length=500)

    @field_validator("url")
    @classmethod
    def url_is_http(cls, v: str) -> str:
        checked = _check_url(v)
        if checked is None:
            raise ValueError("url is required")
        return checked


class AboutUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=200)
    bio: str = Field(max_length=5000)
    profile_pic: str = Field(max_length=500)
    skills: List[str] = Field(default=[], max_length=100)
    socials: List[SocialLink] = Field(default=[], max_length=20)

    @field_validator("profile_pic")
    @classmethod
    def pic_is_url(cls, v: str) -> str:
        return _check_url(v, allow_relative=True) or ""


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    tech_stack: List[str] = Field(default=[], max_length=50)
    github_url: Optional[str] = Field(default=None, max_length=500)
    featured: bool = False
    category: str = Field(default="General", max_length=100)
    difficulty: int = Field(default=1, ge=1, le=5)

    @field_validator("github_url")
    @classmethod
    def github_is_url(cls, v: Optional[str]) -> Optional[str]:
        return _check_url(v)

    @field_validator("tech_stack")
    @classmethod
    def clean_tech(cls, v: List[str]) -> List[str]:
        return [t.strip() for t in v if t.strip()]


class ProjectUpdate(BaseModel):
    """Same fields as ProjectCreate, but all optional: only sent fields change."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    tech_stack: Optional[List[str]] = Field(default=None, max_length=50)
    github_url: Optional[str] = Field(default=None, max_length=500)
    featured: Optional[bool] = None
    category: Optional[str] = Field(default=None, max_length=100)
    difficulty: Optional[int] = Field(default=None, ge=1, le=5)

    @field_validator("github_url")
    @classmethod
    def github_is_url(cls, v: Optional[str]) -> Optional[str]:
        return _check_url(v)

    @field_validator("tech_stack")
    @classmethod
    def clean_tech(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        return [t.strip() for t in v if t.strip()]
