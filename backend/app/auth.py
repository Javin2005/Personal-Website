"""Who is allowed to change the site.

There are two ways to prove you're the admin:

1. Log in with username + password at /api/token. You get a JWT that is
   valid for 24 hours. The admin page uses this.
2. An API key, created on the admin page (API keys tab). Meant for
   programs acting for you, like Claude through the MCP server in
   mcp-server/. A key can edit content but cannot create or delete other
   keys, and you can revoke it at any time.

Both are sent the same way: `Authorization: Bearer <token or key>`.
"""
import hashlib
import os
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from .database import get_session
from .models import ApiKey

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    raise RuntimeError("CRITICAL: SECRET_KEY is not set in the environment variables!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
API_KEY_PREFIX = "pwk_"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# Used when someone logs in with a username that doesn't exist: we still
# run a bcrypt check against this, so the answer takes the same time
# either way and nobody can find out usernames by timing the response.
DUMMY_HASH = get_password_hash("not-a-real-password")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def hash_api_key(key: str) -> str:
    """API keys are stored only as a SHA-256 hash, like passwords. The keys
    are long and random, so a fast hash is enough (no need for bcrypt)."""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _user_from_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise _unauthorized()
    username = payload.get("sub", "")
    if not username:
        raise _unauthorized()
    return username


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> str:
    """The lock on every admin endpoint: accepts a login token or an API key."""
    if token.startswith(API_KEY_PREFIX):
        key = session.exec(select(ApiKey).where(ApiKey.key_hash == hash_api_key(token))).first()
        if not key:
            raise _unauthorized()
        now = datetime.now(timezone.utc)
        last = key.last_used_at
        if last is not None and last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        # Remember when the key was last used, at most once a minute.
        if last is None or now - last > timedelta(minutes=1):
            key.last_used_at = now
            session.add(key)
            session.commit()
        return f"api-key:{key.name}"
    return _user_from_jwt(token)


def require_password_login(token: str = Depends(oauth2_scheme)) -> str:
    """Stricter lock: only a real login works, not an API key. Used for
    managing API keys, so a leaked key can't make more keys."""
    if token.startswith(API_KEY_PREFIX):
        raise HTTPException(status_code=403, detail="Log in with your password to manage API keys")
    return _user_from_jwt(token)
