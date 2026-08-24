"""Alembic environment. Pulls the DB URL from app settings (env-driven) and
targets the ORM metadata so autogenerate works."""

from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.db.database import Base

# Import models so their tables register on Base.metadata.
from app.db import models  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # Fail fast if the DB can't be reached, rather than blocking the deploy.
        connect_args={"connect_timeout": 15},
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            # Backstop: if some session still holds a conflicting lock, error out
            # within 30s (Railway retries the deploy) instead of hanging for
            # minutes. app.db.preflight normally clears such sessions first.
            connection.exec_driver_sql("SET lock_timeout = '30s'")
            context.run_migrations()
        # Migrations are now committed (begin_transaction block exited). On
        # platforms where gracefully closing the DB socket hangs (Railway's
        # private IPv6 network), hard-exit here so the deploy's start chain
        # proceeds to uvicorn instead of blocking on connection teardown.
        # Guarded by an env flag so ordinary alembic commands (revision,
        # downgrade, local dev) close cleanly and are unaffected.
        if os.getenv("ALEMBIC_HARD_EXIT") == "1":
            sys.stdout.flush()
            sys.stderr.flush()
            os._exit(0)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
