"""Resend transactional email client.

Fails soft: if RESEND_API_KEY is unset (local dev) or the API errors, we log
a warning and continue instead of crashing the request. Never log the API key.
"""

from __future__ import annotations

import logging

import httpx

from app.config import settings
from app.email import templates

logger = logging.getLogger("app.email")

RESEND_URL = "https://api.resend.com/emails"


def _send(to: str, subject: str, html: str) -> bool:
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s (subject=%r)", to, subject)
        return False
    try:
        resp = httpx.post(
            RESEND_URL,
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.email_from,
                "to": [to],
                "subject": subject,
                "html": html,
            },
            timeout=15.0,
        )
        if resp.status_code >= 400:
            logger.error("Resend error %s sending to %s", resp.status_code, to)
            return False
        return True
    except httpx.HTTPError as exc:  # network/timeout — don't crash the caller
        logger.error("Resend request failed for %s: %s", to, exc.__class__.__name__)
        return False


def send_verification_email(to: str, token: str) -> bool:
    link = f"{settings.app_url}/verify?token={token}"
    return _send(to, "Verify your Lyra account", templates.verification_html(link))


def send_welcome_email(to: str) -> bool:
    return _send(to, "Welcome to Lyra", templates.welcome_html(settings.app_url))


def send_receipt_email(to: str, amount: str | None = None) -> bool:
    return _send(to, "Your Lyra receipt", templates.receipt_html(amount))
