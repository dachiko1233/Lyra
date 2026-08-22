"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-21
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# create_type=False: we create these enum types once, explicitly, in upgrade().
# postgresql.ENUM honors create_type=False so the table DDL that references the
# enum does NOT re-emit CREATE TYPE (which would raise "type already exists").
plan_enum = postgresql.ENUM("free", "pro", name="plan", create_type=False)
sub_status_enum = postgresql.ENUM(
    "active", "canceled", "past_due", name="subscription_status", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()
    plan_enum.create(bind, checkfirst=True)
    sub_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("plan", plan_enum, nullable=False, server_default="free"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "verification_tokens",
        sa.Column("token", sa.String(length=64), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_verification_tokens_user_id", "verification_tokens", ["user_id"]
    )

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("dodo_subscription_id", sa.String(length=255), nullable=False),
        sa.Column("status", sub_status_enum, nullable=False),
        sa.Column("plan", plan_enum, nullable=False, server_default="pro"),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("dodo_subscription_id", name="uq_dodo_subscription_id"),
    )
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])

    op.create_table(
        "entitlements",
        sa.Column("user_id", sa.String(length=36), primary_key=True),
        sa.Column("max_messages_per_day", sa.Integer(), nullable=False),
        sa.Column("max_documents", sa.Integer(), nullable=False),
        sa.Column("priority", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "processed_webhooks",
        sa.Column("event_id", sa.String(length=255), primary_key=True),
        sa.Column(
            "processed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "message_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_message_logs_user_id", "message_logs", ["user_id"])
    op.create_index("ix_message_logs_created_at", "message_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("message_logs")
    op.drop_table("processed_webhooks")
    op.drop_table("entitlements")
    op.drop_table("subscriptions")
    op.drop_table("verification_tokens")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    bind = op.get_bind()
    sub_status_enum.drop(bind, checkfirst=True)
    plan_enum.drop(bind, checkfirst=True)
