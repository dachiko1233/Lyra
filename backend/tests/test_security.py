"""Unit tests for password hashing and JWT handling."""

from __future__ import annotations

from app.auth import security


def test_password_hash_roundtrip() -> None:
    h = security.hash_password("correct horse battery staple")
    assert h != "correct horse battery staple"  # never store plaintext
    assert security.verify_password("correct horse battery staple", h)
    assert not security.verify_password("wrong password", h)


def test_verification_token_is_random_and_urlsafe() -> None:
    a = security.generate_verification_token()
    b = security.generate_verification_token()
    assert a != b
    assert len(a) >= 32


def test_access_token_roundtrip() -> None:
    token = security.create_access_token("user-123")
    assert security.decode_token(token, "access") == "user-123"
    # Wrong type must not validate.
    assert security.decode_token(token, "refresh") is None


def test_refresh_token_roundtrip() -> None:
    token = security.create_refresh_token("user-abc")
    assert security.decode_token(token, "refresh") == "user-abc"


def test_tampered_token_rejected() -> None:
    token = security.create_access_token("user-1")
    assert security.decode_token(token + "x", "access") is None
