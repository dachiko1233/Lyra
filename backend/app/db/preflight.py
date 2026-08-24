"""Startup preflight: clear stale DB sessions that would block migrations.

When a deploy is killed mid-``alembic upgrade`` (e.g. it lost the platform
healthcheck while importing, or ran out of time), its PostgreSQL session can
linger — holding ACCESS EXCLUSIVE locks on the tables it was creating — until
TCP keepalive finally reaps it minutes later. That is long enough to make the
*next* deploy's ``alembic upgrade head`` hang indefinitely right after it
connects, so the new container never reaches uvicorn and also fails its
healthcheck. The result is a deploy loop that only breaks when the database is
restarted by hand.

This module terminates any such long-lived transaction in our own database
before migrations run. It is a no-op in normal operation: real request
transactions are short-lived, so nothing matches the age threshold. It never
raises — a preflight problem must not be able to block startup on its own.
"""

from __future__ import annotations

import logging

from sqlalchemy import create_engine, text

from app.config import settings

logger = logging.getLogger("app.preflight")

# Only sessions whose current transaction is older than this are considered
# stale. Normal API request transactions finish in well under a second.
STALE_XACT_SECONDS = 30


def main() -> None:
    # AUTOCOMMIT + pre-ping so this quick maintenance query can't itself wedge.
    engine = create_engine(
        settings.database_url,
        isolation_level="AUTOCOMMIT",
        pool_pre_ping=True,
    )
    try:
        with engine.connect() as conn:
            # Fail fast rather than queue behind a lock we are trying to clear.
            conn.execute(text(f"SET lock_timeout = '{STALE_XACT_SECONDS}s'"))
            rows = conn.execute(
                text(
                    """
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                      AND pid <> pg_backend_pid()
                      AND xact_start IS NOT NULL
                      AND now() - xact_start > make_interval(secs => :age)
                    """
                ),
                {"age": STALE_XACT_SECONDS},
            ).fetchall()
            terminated = sum(1 for r in rows if r[0])
            if terminated:
                logger.warning(
                    "preflight: terminated %d stale DB session(s) that were "
                    "holding locks (likely a killed prior migration)",
                    terminated,
                )
            else:
                logger.info("preflight: no stale DB sessions to clear")
    except Exception as exc:  # never block startup on preflight
        logger.warning(
            "preflight skipped (%s): %s", exc.__class__.__name__, exc
        )
    finally:
        engine.dispose()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    main()
