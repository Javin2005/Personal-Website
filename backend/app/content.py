"""Endpoints for the editable content of the site.

Experience, education, skills, interests and projects all work the same
way: a list of items the admin can add to, edit, hide, reorder and delete.
Instead of writing the same six endpoints five times, `collection_router`
builds them for any table + input schema pair.
"""
from typing import List, Type

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, SQLModel, func, select

from .auth import get_current_user
from .database import get_session
from .default_content import DEFAULT_SETTINGS
from .models import About, Education, Experience, Interest, Project, SiteSettings, SkillGroup
from .schemas import (
    EducationIn,
    ExperienceIn,
    InterestIn,
    ProjectIn,
    SettingsData,
    SkillGroupIn,
)

router = APIRouter(prefix="/api")


def ordered(model):
    return select(model).order_by(model.sort_order, model.id)


def collection_router(path: str, model: Type[SQLModel], schema: Type[BaseModel]) -> APIRouter:
    """Builds, for e.g. path="experience":

    GET    /api/experience              public: visible items, in order
    GET    /api/admin/experience        admin: all items, including hidden
    POST   /api/experience              admin: add an item at the end
    PUT    /api/experience/order        admin: body [3, 1, 2] = new order of ids
    PUT    /api/experience/{id}         admin: replace an item
    DELETE /api/experience/{id}         admin: delete an item
    """
    r = APIRouter(prefix="/api")

    @r.get(f"/{path}", response_model=List[model])
    def list_public(session: Session = Depends(get_session)):
        return session.exec(ordered(model).where(model.visible == True)).all()  # noqa: E712

    @r.get(f"/admin/{path}", response_model=List[model])
    def list_all(session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
        return session.exec(ordered(model)).all()

    @r.post(f"/{path}", response_model=model)
    def create(data: schema, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
        last = session.exec(select(func.max(model.sort_order))).one()
        item = model(**data.model_dump(), sort_order=(last or 0) + 1)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

    # Must be declared before /{item_id}, otherwise "order" would be read as an id.
    @r.put(f"/{path}/order")
    def reorder(ids: List[int], session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
        for position, item_id in enumerate(ids):
            item = session.get(model, item_id)
            if item:
                item.sort_order = position
                session.add(item)
        session.commit()
        return {"status": "ok"}

    @r.put(f"/{path}/{{item_id}}", response_model=model)
    def update(item_id: int, data: schema, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        for key, value in data.model_dump().items():
            setattr(item, key, value)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

    @r.delete(f"/{path}/{{item_id}}")
    def delete(item_id: int, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        session.delete(item)
        session.commit()
        return {"status": "deleted"}

    return r


COLLECTIONS = [
    ("projects", Project, ProjectIn),
    ("experience", Experience, ExperienceIn),
    ("education", Education, EducationIn),
    ("skills", SkillGroup, SkillGroupIn),
    ("interests", Interest, InterestIn),
]
collection_routers = [collection_router(*c) for c in COLLECTIONS]


# ---------------------------------------------------------------- settings

def get_settings(session: Session) -> dict:
    """The saved settings, with any setting that didn't exist when they were
    saved filled in from the defaults (so adding a new setting in code
    never breaks an older database)."""
    row = session.get(SiteSettings, 1)
    saved = row.data if row and row.data else {}
    merged = {**DEFAULT_SETTINGS, **saved}
    for key in ("theme", "video", "hero", "labels"):
        merged[key] = {**DEFAULT_SETTINGS[key], **saved.get(key, {})}
    return merged


def ensure_settings_row():
    """Called on startup: create the settings row the first time."""
    from .database import engine

    with Session(engine) as session:
        if not session.get(SiteSettings, 1):
            session.add(SiteSettings(id=1, data=DEFAULT_SETTINGS))
            session.commit()


@router.get("/settings")
def read_settings(session: Session = Depends(get_session)):
    return get_settings(session)


@router.put("/settings")
def save_settings(data: SettingsData, session: Session = Depends(get_session), admin: str = Depends(get_current_user)):
    row = session.get(SiteSettings, 1) or SiteSettings(id=1)
    row.data = data.model_dump()
    session.add(row)
    session.commit()
    return row.data


@router.get("/settings/defaults")
def read_default_settings(admin: str = Depends(get_current_user)):
    """Lets the admin page offer a "reset to default" button."""
    return DEFAULT_SETTINGS


# ---------------------------------------------------------------- everything at once

@router.get("/site")
def read_site(session: Session = Depends(get_session)):
    """Everything the public pages need, in one request.

    The free Render server can take a while to wake up, so one request is
    much better than seven separate ones.
    """
    def visible(model):
        return session.exec(ordered(model).where(model.visible == True)).all()  # noqa: E712

    return {
        "settings": get_settings(session),
        "about": session.exec(select(About)).first(),
        "skills": visible(SkillGroup),
        "interests": visible(Interest),
        "experience": visible(Experience),
        "education": visible(Education),
        "projects": visible(Project),
    }
