"""API keys for programs that edit the site for you (e.g. the MCP server).

Revision ID: 0003_api_keys
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_api_keys"
down_revision = "0002_editable_content"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if "api_key" in sa.inspect(op.get_bind()).get_table_names():
        return
    op.create_table(
        "api_key",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("prefix", sa.String, nullable=False),
        sa.Column("key_hash", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_api_key_key_hash", "api_key", ["key_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_api_key_key_hash", table_name="api_key")
    op.drop_table("api_key")
