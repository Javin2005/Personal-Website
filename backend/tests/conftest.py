"""Test setup: every test run uses a fresh SQLite database in a temp folder,
so the tests never touch your real data. Run with:

    poetry run pytest
"""
import os
import tempfile

# These must be set before the app is imported.
_tmp = tempfile.mkdtemp(prefix="site-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["SECRET_KEY"] = "test-secret-key"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import Session, select  # noqa: E402

from app.auth import get_password_hash  # noqa: E402
from app.database import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402

ADMIN = {"username": "admin", "password": "correct horse battery staple"}


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:  # "with" runs startup: migrations + settings row
        with Session(engine) as session:
            if not session.exec(select(User)).first():
                session.add(User(username=ADMIN["username"], hashed_password=get_password_hash(ADMIN["password"])))
                session.commit()
        yield c


@pytest.fixture(autouse=True)
def reset_rate_limits():
    app.state.limiter.reset()
    yield


@pytest.fixture(scope="session")
def token(client):
    app.state.limiter.reset()  # session fixtures run before the autouse reset
    res = client.post("/api/token", data=ADMIN)
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}
