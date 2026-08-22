"""Minimal Dodo Payments API client (checkout session creation)."""

from __future__ import annotations

import logging

import httpx

from app.config import settings

logger = logging.getLogger("app.payments")


class DodoError(RuntimeError):
    pass


def create_checkout_session(user_id: str, email: str) -> str:
    """Create a Dodo checkout session for the Pro product; return its URL.

    We pass the user id as metadata so the webhook can map the resulting
    subscription back to our user.
    """
    if not settings.dodo_api_key or not settings.dodo_pro_product_id:
        raise DodoError("Payments are not configured on this server.")

    url = f"{settings.dodo_api_base.rstrip('/')}/checkouts"
    payload = {
        "product_cart": [{"product_id": settings.dodo_pro_product_id, "quantity": 1}],
        "customer": {"email": email},
        "metadata": {"user_id": user_id},
        "return_url": f"{settings.app_url}/app?upgraded=1",
    }
    try:
        resp = httpx.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.dodo_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20.0,
        )
    except httpx.HTTPError as exc:
        logger.error("Dodo checkout request failed: %s", exc.__class__.__name__)
        raise DodoError("Could not reach the payment provider.") from exc

    if resp.status_code >= 400:
        logger.error("Dodo checkout error %s", resp.status_code)
        raise DodoError("Payment provider rejected the checkout request.")

    data = resp.json()
    checkout_url = data.get("checkout_url") or data.get("url") or data.get("payment_link")
    if not checkout_url:
        raise DodoError("Payment provider did not return a checkout URL.")
    return str(checkout_url)
