"""Editable content: site settings, experience, education, skills,
interests, and extra project columns (media, live link, order, visibility).

Revision ID: 0002_editable_content
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_editable_content"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def _tables() -> list:
    return sa.inspect(op.get_bind()).get_table_names()


def _columns(table: str) -> list:
    return [c["name"] for c in sa.inspect(op.get_bind()).get_columns(table)]


def _ordered_columns():
    """Columns every orderable collection has."""
    return [
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("visible", sa.Boolean, nullable=False, server_default=sa.true()),
    ]


def upgrade() -> None:
    # New columns on the existing project table. server_default fills in
    # a value for rows that are already there.
    existing = _columns("project")
    new_columns = [
        sa.Column("live_url", sa.String, nullable=True),
        sa.Column("media_url", sa.String, nullable=True),
        sa.Column("period", sa.String, nullable=False, server_default=""),
        *_ordered_columns(),
    ]
    with op.batch_alter_table("project") as batch:
        for column in new_columns:
            if column.name not in existing:
                batch.add_column(column)

    tables = _tables()
    if "site_settings" not in tables:
        op.create_table(
            "site_settings",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("data", sa.JSON),
        )
    if "experience" not in tables:
        op.create_table(
            "experience",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("role", sa.String, nullable=False),
            sa.Column("organisation", sa.String, nullable=False),
            sa.Column("location", sa.String, nullable=False, server_default=""),
            sa.Column("period", sa.String, nullable=False, server_default=""),
            sa.Column("summary", sa.String, nullable=False, server_default=""),
            sa.Column("tags", sa.JSON),
            *_ordered_columns(),
        )
    if "education" not in tables:
        op.create_table(
            "education",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("school", sa.String, nullable=False),
            sa.Column("programme", sa.String, nullable=False),
            sa.Column("location", sa.String, nullable=False, server_default=""),
            sa.Column("period", sa.String, nullable=False, server_default=""),
            sa.Column("notes", sa.String, nullable=False, server_default=""),
            sa.Column("courses", sa.JSON),
            *_ordered_columns(),
        )
    if "skill_group" not in tables:
        op.create_table(
            "skill_group",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("label", sa.String, nullable=False),
            sa.Column("items", sa.JSON),
            *_ordered_columns(),
        )
    if "interest" not in tables:
        op.create_table(
            "interest",
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("category", sa.String, nullable=False),
            sa.Column("title", sa.String, nullable=False),
            sa.Column("creator", sa.String, nullable=False, server_default=""),
            sa.Column("note", sa.String, nullable=False, server_default=""),
            *_ordered_columns(),
        )


def downgrade() -> None:
    for table in ["interest", "skill_group", "education", "experience", "site_settings"]:
        op.drop_table(table)
    with op.batch_alter_table("project") as batch:
        for name in ["visible", "sort_order", "period", "media_url", "live_url"]:
            batch.drop_column(name)
