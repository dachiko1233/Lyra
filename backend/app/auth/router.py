"""Auth routes: register, verify, login, refresh, me.

Rules enforced here (CLAUDE.md §5/§11):
  - argon2 password hashing
  - single-use, expiring verification tokens
  - login allowed only for verified accounts
  - never log passwords, tokens, or JWTs
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.auth import security
from app.auth.deps import get_current_user
from app.db.database import get_db
from app.db.models import Plan, User, VerificationToken
from app.email import client as email_client
from app.entitlements import service as entitlements
from app.entitlements.plans import limits_for

router = APIRouter(prefix="/api/auth", tags=["auth"])


# --- Schemas ---------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class EntitlementOut(BaseModel):
    max_messages_per_day: int
    max_documents: int
    priority: bool
    messages_remaining_today: int


class MeOut(BaseModel):
    id: str
    email: str
    is_verified: bool
    plan: Plan
    entitlements: EntitlementOut


# --- Routes ----------------------------------------------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> dict[str, str]:
    existing = db.query(User).filter(User.email == payload.email).one_or_none()
    if existing is not None:
        # Don't reveal whether an email exists beyond a generic conflict.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    user = User(
        email=payload.email,
        password_hash=security.hash_password(payload.password),
        is_verified=False,
        plan=Plan.free,
    )
    db.add(user)
    db.flush()  # assign user.id

    # Grant free-tier entitlements immediately.
    entitlements.grant_plan(db, user, Plan.free)

    token = VerificationToken(
        token=security.generate_verification_token(),
        user_id=user.id,
        expires_at=security.verification_expiry(),
    )
    db.add(token)
    db.commit()

    email_client.send_verification_email(user.email, token.token)
    return {"message": "Registered. Check your email to verify your account."}


@router.get("/verify")
def verify(token: str = Query(...), db: Session = Depends(get_db)) -> dict[str, str]:
    row = db.get(VerificationToken, token)
    if row is None:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
    if row.used_at is not None:
        raise HTTPException(status_code=400, detail="This link has already been used.")
    if row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This link has expired.")

    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Account no longer exists.")

    user.is_verified = True
    row.used_at = datetime.now(timezone.utc)
    db.commit()

    email_client.send_welcome_email(user.email)
    return {"message": "Email verified. You can now log in."}


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == payload.email).one_or_none()
    if user is None or not security.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in.",
        )
    return TokenOut(
        access_token=security.create_access_token(user.id),
        refresh_token=security.create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenOut:
    user_id = security.decode_token(payload.refresh_token, "refresh")
    if user_id is None or db.get(User, user_id) is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")
    return TokenOut(
        access_token=security.create_access_token(user_id),
        refresh_token=security.create_refresh_token(user_id),
    )


@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MeOut:
    ent = entitlements.get_entitlement(db, user)
    remaining = entitlements.remaining_messages_today(db, user)
    _ = limits_for(user.plan)  # ensures plan is a known plan
    return MeOut(
        id=user.id,
        email=user.email,
        is_verified=user.is_verified,
        plan=user.plan,
        entitlements=EntitlementOut(
            max_messages_per_day=ent.max_messages_per_day,
            max_documents=ent.max_documents,
            priority=ent.priority,
            messages_remaining_today=remaining,
        ),
    )
