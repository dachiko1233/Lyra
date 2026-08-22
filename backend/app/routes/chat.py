"""POST /api/chat — auth + entitlement gated, streamed grounded answers.

Gates (server-side, in order): authenticated → verified → daily message limit.
The frontend is never trusted for any of these.
"""

from __future__ import annotations

from collections.abc import Iterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.deps import require_verified
from app.db.database import get_db
from app.db.models import User
from app.entitlements import service as entitlements
from app.rag.query import stream_answer

router = APIRouter(prefix="/api", tags=["chat"])


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


@router.post("/chat")
def chat(
    payload: ChatIn,
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    # Entitlement gate: daily message limit, read from the DB.
    if not entitlements.can_send_message(db, user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You've reached your daily message limit. Upgrade to Pro for more.",
        )

    # Record the message against today's quota before streaming.
    entitlements.record_message(db, user.id)
    db.commit()

    question = payload.message

    def generate() -> Iterator[bytes]:
        # Stream tokens as plain UTF-8 text (text/plain, chunked).
        for token in stream_answer(question):
            yield token.encode("utf-8")

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")
