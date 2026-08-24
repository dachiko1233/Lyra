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

            # --- diagnostics (surface DB state into the deploy logs) ---
            try:
                total, maxc = conn.execute(
                    text(
                        "SELECT (SELECT count(*) FROM pg_stat_activity "
                        "WHERE datname = current_database()), "
                        "current_setting('max_connections')"
                    )
                ).one()
                logger.info("preflight: %s connections to this DB (max=%s)", total, maxc)
                for r in conn.execute(
                    text(
                        "SELECT pid, state, application_name, wait_event_type, "
                        "wait_event, coalesce(extract(epoch from now()-xact_start)::int,-1) "
                        "FROM pg_stat_activity WHERE datname = current_database() "
                        "AND pid <> pg_backend_pid()"
                    )
                ):
                    logger.info(
                        "preflight: session pid=%s state=%s app=%r wait=%s/%s xact_age=%ss",
                        r[0], r[1], r[2], r[3], r[4], r[5],
                    )
                try:
                    ver = conn.execute(
                        text("SELECT version_num FROM alembic_version")
                    ).scalars().all()
                    logger.info("preflight: alembic_version=%s", ver)
                except Exception as exc:
                    logger.info(
                        "preflight: alembic_version not readable (%s)",
                        exc.__class__.__name__,
                    )
            except Exception as exc:
                logger.info("preflight: diagnostics failed (%s)", exc.__class__.__name__)
    except Exception as exc:  # never block startup on preflight
        logger.warning(
            "preflight skipped (%s): %s", exc.__class__.__name__, exc
        )
    finally:
        engine.dispose()


if __name__ == "__main__":
    import os
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    main()
    # Force immediate exit. A lingering DB socket over Railway's private network
    # can otherwise stall interpreter shutdown, which would wedge the
    # "preflight && alembic && uvicorn" start chain before migrations even run.
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(0)
