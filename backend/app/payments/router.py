"""POST /api/payments/checkout — authenticated Pro checkout."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.deps import require_verified
from app.db.models import User
from app.payments.dodo import DodoError, create_checkout_session

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CheckoutOut(BaseModel):
    checkout_url: str


@router.post("/checkout", response_model=CheckoutOut)
def checkout(user: User = Depends(require_verified)) -> CheckoutOut:
    try:
        url = create_checkout_session(user.id, user.email)
    except DodoError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return CheckoutOut(checkout_url=url)
