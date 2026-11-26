"""Create, list and revoke API keys. Only works when logged in with your
password (an API key can't manage keys)."""
import secrets
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, func, select

from .auth import API_KEY_PREFIX, hash_api_key, require_password_login
from .database import get_session
from .models import ApiKey

router = APIRouter(prefix="/api/admin/api-keys")

MAX_KEYS = 10


class ApiKeyIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class ApiKeyOut(BaseModel):
    id: int
    name: str
    prefix: str
    created_at: datetime
    last_used_at: Optional[datetime]


class ApiKeyCreated(ApiKeyOut):
    key: str  # the full key, returned only once


@router.get("", response_model=List[ApiKeyOut])
def list_keys(session: Session = Depends(get_session), admin: str = Depends(require_password_login)):
    return session.exec(select(ApiKey).order_by(ApiKey.id)).all()


@router.post("", response_model=ApiKeyCreated)
def create_key(data: ApiKeyIn, session: Session = Depends(get_session), admin: str = Depends(require_password_login)):
    if session.exec(select(func.count()).select_from(ApiKey)).one() >= MAX_KEYS:
        raise HTTPException(status_code=400, detail=f"You can have at most {MAX_KEYS} keys. Revoke one first.")
    key = API_KEY_PREFIX + secrets.token_urlsafe(32)
    row = ApiKey(name=data.name.strip(), prefix=key[:12], key_hash=hash_api_key(key))
    session.add(row)
    session.commit()
    session.refresh(row)
    return ApiKeyCreated(**row.model_dump(), key=key)


@router.delete("/{key_id}")
def revoke_key(key_id: int, session: Session = Depends(get_session), admin: str = Depends(require_password_login)):
    row = session.get(ApiKey, key_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(row)
    session.commit()
    return {"status": "revoked"}
