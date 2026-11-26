"""Tells Alembic which database to change. It uses the same DATABASE_URL as
the app (Postgres in production, the local SQLite file in development)."""
from alembic import context
from sqlmodel import SQLModel

from app.database import engine
from app import models  # noqa: F401  (importing registers the tables)

target_metadata = SQLModel.metadata


def run_migrations_online() -> None:
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=connection.dialect.name == "sqlite",
        )
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
