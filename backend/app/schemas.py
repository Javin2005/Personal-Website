"""Shapes of data the API *accepts* from the frontend.

The classes in models.py are database tables. SQLModel does NOT validate
table models when they are used as request bodies, so these Pydantic models
are what FastAPI checks every request against before your endpoint runs.
Invalid input gets an automatic 422 response listing what is wrong.
"""
import re
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------- helpers

HEX_COLOR = r"^#[0-9a-fA-F]{6}$"

# Fonts the admin can pick from. Each maps to the weights to request from
# Google Fonts. Keeping a fixed list means nobody can inject CSS through a
# font name, and every font is known to have the weights we ask for.
FONTS = {
    "Unbounded": "200..900",
    "IBM Plex Sans": "300;400;500;600",
    "IBM Plex Mono": "400;500",
    "Space Grotesk": "300..700",
    "Public Sans": "300..800",
    "JetBrains Mono": "400..700",
    "Instrument Serif": "400",
    "Orbitron": "400..900",
    "Oxanium": "200..800",
    "Sora": "300..700",
    "Manrope": "300..800",
    "DM Mono": "300;400;500",
}


def check_url(value: Optional[str], allow_relative: bool = False) -> Optional[str]:
    """Allow http(s) links (and optionally site paths like /assets/x.jpg).

    Blocks things like `javascript:alert(1)` which would run code when clicked.
    """
    if value is None or value.strip() == "":
        return None
    value = value.strip()
    if value.startswith(("https://", "http://")):
        return value
    if allow_relative and value.startswith("/") and not value.startswith("//"):
        return value
    raise ValueError("must be an http(s) URL" + (" or a path starting with /" if allow_relative else ""))


def clean_list(items: List[str]) -> List[str]:
    return [i.strip() for i in items if i and i.strip()]


# ---------------------------------------------------------------- settings

class Theme(BaseModel):
    bg: str = Field(pattern=HEX_COLOR)
    surface: str = Field(pattern=HEX_COLOR)
    text: str = Field(pattern=HEX_COLOR)
    muted: str = Field(pattern=HEX_COLOR)
    accent: str = Field(pattern=HEX_COLOR)
    accent2: str = Field(pattern=HEX_COLOR)
    fontDisplay: str
    fontBody: str
    fontMono: str

    @field_validator("fontDisplay", "fontBody", "fontMono")
    @classmethod
    def known_font(cls, v: str) -> str:
        if v not in FONTS:
            raise ValueError(f"unknown font; choose one of: {', '.join(FONTS)}")
        return v


class Video(BaseModel):
    enabled: bool = True
    src: str = Field(max_length=500)
    opacity: float = Field(ge=0, le=1)
    dimOnScroll: bool = True

    @field_validator("src")
    @classmethod
    def src_url(cls, v: str) -> str:
        return check_url(v, allow_relative=True) or ""


class Hero(BaseModel):
    eyebrow: str = Field(max_length=120)
    firstLine: str = Field(min_length=1, max_length=60)
    secondLine: str = Field(max_length=60)
    intro: str = Field(max_length=600)
    status: str = Field(max_length=160)
    footer: List[str] = Field(max_length=6)
    readout: List[str] = Field(max_length=4)
    showPortrait: bool = True


SectionId = Literal["about", "interests", "experience", "education", "projects", "contact"]


class Section(BaseModel):
    id: SectionId
    title: str = Field(min_length=1, max_length=60)
    intro: str = Field(default="", max_length=600)
    visible: bool = True


class NavLink(BaseModel):
    label: str = Field(min_length=1, max_length=30)
    href: str = Field(max_length=200)

    @field_validator("href")
    @classmethod
    def href_ok(cls, v: str) -> str:
        v = v.strip()
        if re.match(r"^(/|#|https?://)", v):
            return v
        raise ValueError("must start with /, # or http(s)://")


class SettingsData(BaseModel):
    theme: Theme
    video: Video
    hero: Hero
    sections: List[Section] = Field(min_length=1, max_length=12)
    nav: List[NavLink] = Field(max_length=8)
    contactEmail: str = Field(default="", max_length=200)
    footerNote: str = Field(default="", max_length=300)
    showStatus: bool = True
    projectsPageIntro: str = Field(default="", max_length=600)
    toolsPageIntro: str = Field(default="", max_length=600)

    @field_validator("sections")
    @classmethod
    def unique_sections(cls, v: List[Section]) -> List[Section]:
        ids = [s.id for s in v]
        if len(ids) != len(set(ids)):
            raise ValueError("each section can only appear once")
        return v


# ---------------------------------------------------------------- about

class SocialLink(BaseModel):
    platform: str = Field(min_length=1, max_length=50)
    url: str = Field(max_length=500)

    @field_validator("url")
    @classmethod
    def url_is_http(cls, v: str) -> str:
        checked = check_url(v)
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
        return check_url(v, allow_relative=True) or ""


# ---------------------------------------------------------------- collections
# Each one is used for both "create" (POST) and "save" (PUT): the admin
# editor always sends the whole item.

class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    tech_stack: List[str] = Field(default=[], max_length=50)
    github_url: Optional[str] = Field(default=None, max_length=500)
    live_url: Optional[str] = Field(default=None, max_length=500)
    media_url: Optional[str] = Field(default=None, max_length=500)
    featured: bool = False
    category: str = Field(default="", max_length=100)
    difficulty: int = Field(default=3, ge=1, le=5)
    period: str = Field(default="", max_length=60)
    visible: bool = True

    @field_validator("github_url", "live_url")
    @classmethod
    def http_only(cls, v: Optional[str]) -> Optional[str]:
        return check_url(v)

    @field_validator("media_url")
    @classmethod
    def media_ok(cls, v: Optional[str]) -> Optional[str]:
        return check_url(v, allow_relative=True)

    @field_validator("tech_stack")
    @classmethod
    def clean(cls, v: List[str]) -> List[str]:
        return clean_list(v)


class ExperienceIn(BaseModel):
    role: str = Field(min_length=1, max_length=150)
    organisation: str = Field(min_length=1, max_length=150)
    location: str = Field(default="", max_length=100)
    period: str = Field(default="", max_length=60)
    summary: str = Field(default="", max_length=3000)
    tags: List[str] = Field(default=[], max_length=20)
    visible: bool = True

    @field_validator("tags")
    @classmethod
    def clean(cls, v: List[str]) -> List[str]:
        return clean_list(v)


class EducationIn(BaseModel):
    school: str = Field(min_length=1, max_length=150)
    programme: str = Field(min_length=1, max_length=200)
    location: str = Field(default="", max_length=100)
    period: str = Field(default="", max_length=60)
    notes: str = Field(default="", max_length=3000)
    courses: List[str] = Field(default=[], max_length=80)
    visible: bool = True

    @field_validator("courses")
    @classmethod
    def clean(cls, v: List[str]) -> List[str]:
        return clean_list(v)


class SkillGroupIn(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    items: List[str] = Field(default=[], max_length=60)
    visible: bool = True

    @field_validator("items")
    @classmethod
    def clean(cls, v: List[str]) -> List[str]:
        return clean_list(v)


class InterestIn(BaseModel):
    category: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=1, max_length=150)
    creator: str = Field(default="", max_length=150)
    note: str = Field(default="", max_length=600)
    visible: bool = True
