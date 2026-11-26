"""Baseline: the tables the site had before Alembic was added.

The live database was created by SQLModel's create_all(), so these tables
may already exist. Each one is only created if it's missing, which makes
this safe to run on both the old database and a brand-new one.

Revision ID: 0001_baseline
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def _missing(name: str) -> bool:
    return name not in sa.inspect(op.get_bind()).get_table_names()


def upgrade() -> None:
    if _missing("user"):
        op.create_table(
            "user",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("username", sa.String, nullable=False),
            sa.Column("hashed_password", sa.String, nullable=False),
        )
        op.create_index("ix_user_username", "user", ["username"], unique=True)

    if _missing("about"):
        op.create_table(
            "about",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("name", sa.String, nullable=False),
            sa.Column("title", sa.String, nullable=False),
            sa.Column("bio", sa.String, nullable=False),
            sa.Column("profile_pic", sa.String, nullable=False),
            sa.Column("skills", sa.JSON),
            sa.Column("socials", sa.JSON),
        )

    if _missing("project"):
        op.create_table(
            "project",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("title", sa.String, nullable=False),
            sa.Column("description", sa.String, nullable=False),
            sa.Column("tech_stack", sa.JSON),
            sa.Column("github_url", sa.String, nullable=True),
            sa.Column("featured", sa.Boolean, nullable=False),
            sa.Column("category", sa.String, nullable=False),
            sa.Column("difficulty", sa.Integer, nullable=False),
        )


def downgrade() -> None:
    pass  # never drop the original tables automatically
