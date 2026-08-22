"""POST /api/webhooks/dodo — verify signature, be idempotent, update plan.

Dodo signs webhooks with the Standard Webhooks scheme (same as Svix):
  signed_content = f"{webhook-id}.{webhook-timestamp}.{raw_body}"
  signature      = base64(HMAC_SHA256(secret_bytes, signed_content))
The `webhook-signature` header may contain multiple space-separated
`v1,<sig>` values; any match passes.

On a valid event we upsert the subscription and grant/reset entitlements —
the DB + webhook are the single source of truth (CLAUDE.md §5/§11).
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import logging

from fastapi import APIRouter, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import SessionLocal
from app.db.models import (
    Plan,
    ProcessedWebhook,
    Subscription,
    SubscriptionStatus,
    User,
)
from app.email import client as email_client
from app.entitlements import service as entitlements

logger = logging.getLogger("app.payments")

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

ACTIVATE_EVENTS = {"subscription.active", "payment.succeeded", "subscription.renewed"}
DEACTIVATE_EVENTS = {"subscription.canceled", "subscription.cancelled", "subscription.past_due"}


def _secret_bytes() -> bytes:
    """Standard Webhooks secrets are `whsec_<base64>`; decode the b64 part."""
    secret = settings.dodo_webhook_secret
    if secret.startswith("whsec_"):
        secret = secret[len("whsec_") :]
    try:
        return base64.b64decode(secret)
    except Exception:
        # Fall back to raw bytes if the secret isn't base64.
        return settings.dodo_webhook_secret.encode("utf-8")


def _verify_signature(webhook_id: str, timestamp: str, body: bytes, sig_header: str) -> bool:
    if not settings.dodo_webhook_secret:
        logger.error("DODO_WEBHOOK_SECRET is not configured; rejecting webhook.")
        return False
    signed = f"{webhook_id}.{timestamp}.".encode() + body
    expected = base64.b64encode(
        hmac.new(_secret_bytes(), signed, hashlib.sha256).digest()
    ).decode()
    # Header format: "v1,<sig> v1,<sig2>"
    for part in sig_header.split():
        _, _, value = part.partition(",")
        candidate = value or part
        if hmac.compare_digest(candidate, expected):
            return True
    return False


def _extract(data: dict) -> tuple[str | None, str | None, str | None]:
    """Best-effort pull of (user_id, subscription_id, period_end) from payload."""
    obj = data.get("data", data)
    metadata = obj.get("metadata") or data.get("metadata") or {}
    user_id = metadata.get("user_id")
    sub_id = obj.get("subscription_id") or obj.get("id")
    period_end = obj.get("current_period_end") or obj.get("next_billing_date")
    return user_id, sub_id, period_end


def _find_user(db: Session, user_id: str | None, data: dict) -> User | None:
    if user_id:
        user = db.get(User, user_id)
        if user:
            return user
    # Fallback: match by customer email if present.
    obj = data.get("data", data)
    email = (obj.get("customer") or {}).get("email") or obj.get("email")
    if email:
        return db.query(User).filter(User.email == email).one_or_none()
    return None


@router.post("/dodo")
async def dodo_webhook(
    request: Request,
    webhook_id: str = Header(default="", alias="webhook-id"),
    webhook_timestamp: str = Header(default="", alias="webhook-timestamp"),
    webhook_signature: str = Header(default="", alias="webhook-signature"),
) -> dict[str, str]:
    body = await request.body()

    if not _verify_signature(webhook_id, webhook_timestamp, body, webhook_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature.")

    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Malformed JSON.") from exc

    event_type = payload.get("type") or payload.get("event_type") or ""
    event_id = webhook_id or payload.get("id") or ""

    with SessionLocal() as db:
        # Idempotency: Dodo retries. Skip if we've already processed this event.
        if event_id and db.get(ProcessedWebhook, event_id) is not None:
            return {"status": "already_processed"}

        user_id, sub_id, period_end = _extract(payload)
        user = _find_user(db, user_id, payload)

        if user is not None and event_type in ACTIVATE_EVENTS:
            _upsert_subscription(db, user, sub_id, SubscriptionStatus.active, period_end)
            entitlements.grant_plan(db, user, Plan.pro)
            email_client.send_receipt_email(user.email)
            logger.info("Granted Pro to user %s via %s", user.id, event_type)
        elif user is not None and event_type in DEACTIVATE_EVENTS:
            status_val = (
                SubscriptionStatus.past_due
                if "past_due" in event_type
                else SubscriptionStatus.canceled
            )
            _upsert_subscription(db, user, sub_id, status_val, period_end)
            entitlements.grant_plan(db, user, Plan.free)
            logger.info("Downgraded user %s to Free via %s", user.id, event_type)
        else:
            logger.info("Ignoring webhook event_type=%r (user found=%s)", event_type, user is not None)

        if event_id:
            db.add(ProcessedWebhook(event_id=event_id))
        db.commit()

    return {"status": "ok"}


def _upsert_subscription(
    db: Session,
    user: User,
    sub_id: str | None,
    status_val: SubscriptionStatus,
    period_end: str | None,
) -> None:
    from datetime import datetime

    if not sub_id:
        return
    sub = (
        db.query(Subscription)
        .filter(Subscription.dodo_subscription_id == sub_id)
        .one_or_none()
    )
    parsed_end = None
    if period_end:
        try:
            parsed_end = datetime.fromisoformat(str(period_end).replace("Z", "+00:00"))
        except ValueError:
            parsed_end = None

    if sub is None:
        sub = Subscription(
            user_id=user.id,
            dodo_subscription_id=sub_id,
            status=status_val,
            plan=Plan.pro,
            current_period_end=parsed_end,
        )
        db.add(sub)
    else:
        sub.status = status_val
        if parsed_end is not None:
            sub.current_period_end = parsed_end
    db.flush()
