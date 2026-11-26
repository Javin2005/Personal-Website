import fcntl
import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

engine_args = {"connect_args": {"check_same_thread": False}} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, **engine_args)

BACKEND_DIR = Path(__file__).resolve().parent.parent


def run_migrations():
    """Bring the database structure up to date (same as `alembic upgrade head`).

    Gunicorn starts several workers at once and each one calls this. The
    file lock makes them take turns: the first one migrates, the others
    then see there is nothing left to do.
    """
    from alembic import command
    from alembic.config import Config

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))

    lock_path = Path(tempfile.gettempdir()) / "personal-website-migrate.lock"
    with open(lock_path, "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            command.upgrade(config, "head")
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)


def get_session():
    with Session(engine) as session:
        yield session
