"""Grant / read / enforce entitlements. Server-side source of truth.

`enforce_can_send_message` and friends are called on every gated request;
they read the DB, never the client.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Entitlement, MessageLog, Plan, User
from app.entitlements.plans import limits_for


def grant_plan(db: Session, user: User, plan: Plan) -> Entitlement:
    """Set the user's plan and (re)write their entitlement row to match."""
    limits = limits_for(plan)
    user.plan = plan

    ent = db.get(Entitlement, user.id)
    if ent is None:
        ent = Entitlement(user_id=user.id)
        db.add(ent)
    ent.max_messages_per_day = limits.max_messages_per_day
    ent.max_documents = limits.max_documents
    ent.priority = limits.priority
    db.flush()
    return ent


def get_entitlement(db: Session, user: User) -> Entitlement:
    """Return the user's entitlement, healing a missing row from their plan."""
    ent = db.get(Entitlement, user.id)
    if ent is None:
        ent = grant_plan(db, user, user.plan)
    return ent


def messages_used_today(db: Session, user_id: str) -> int:
    start = datetime.now(timezone.utc) - timedelta(days=1)
    stmt = select(func.count(MessageLog.id)).where(
        MessageLog.user_id == user_id, MessageLog.created_at >= start
    )
    return int(db.execute(stmt).scalar_one())


def remaining_messages_today(db: Session, user: User) -> int:
    ent = get_entitlement(db, user)
    used = messages_used_today(db, user.id)
    return max(ent.max_messages_per_day - used, 0)


def can_send_message(db: Session, user: User) -> bool:
    return remaining_messages_today(db, user) > 0


def record_message(db: Session, user_id: str) -> None:
    db.add(MessageLog(user_id=user_id))
    db.flush()
