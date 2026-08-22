"""Webhook signature verification: valid passes, tampered/invalid fails."""

from __future__ import annotations

import base64
import hashlib
import hmac

from app.config import settings
from app.payments import webhook


def _sign(secret_b64_part: str, webhook_id: str, ts: str, body: bytes) -> str:
    key = base64.b64decode(secret_b64_part)
    signed = f"{webhook_id}.{ts}.".encode() + body
    return "v1," + base64.b64encode(
        hmac.new(key, signed, hashlib.sha256).digest()
    ).decode()


def test_valid_signature_passes(monkeypatch) -> None:
    secret_part = base64.b64encode(b"super-secret-key").decode()
    monkeypatch.setattr(settings, "dodo_webhook_secret", f"whsec_{secret_part}")

    body = b'{"type":"subscription.active"}'
    sig = _sign(secret_part, "evt_1", "1700000000", body)
    assert webhook._verify_signature("evt_1", "1700000000", body, sig)


def test_tampered_body_fails(monkeypatch) -> None:
    secret_part = base64.b64encode(b"super-secret-key").decode()
    monkeypatch.setattr(settings, "dodo_webhook_secret", f"whsec_{secret_part}")

    body = b'{"type":"subscription.active"}'
    sig = _sign(secret_part, "evt_1", "1700000000", body)
    tampered = b'{"type":"payment.succeeded"}'
    assert not webhook._verify_signature("evt_1", "1700000000", tampered, sig)


def test_missing_secret_rejects(monkeypatch) -> None:
    monkeypatch.setattr(settings, "dodo_webhook_secret", "")
    assert not webhook._verify_signature("evt_1", "1", b"{}", "v1,whatever")
