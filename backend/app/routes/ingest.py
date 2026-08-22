"""POST /api/ingest — (re)ingest the knowledge base.

Auth + verified gated. Enforces the caller's max_documents entitlement so a
Free user can't index an unlimited corpus. Runs synchronously; for large
corpora move to a background worker.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.deps import require_verified
from app.db.database import get_db
from app.db.models import User
from app.entitlements import service as entitlements
from app.rag.ingest import DATA_DIR, ingest_directory

logger = logging.getLogger("app.rag")

router = APIRouter(prefix="/api", tags=["ingest"])


class IngestOut(BaseModel):
    documents_ingested: int
    message: str


def _count_data_files() -> int:
    return sum(
        1 for p in DATA_DIR.rglob("*") if p.is_file() and p.name != ".gitkeep"
    )


@router.post("/ingest", response_model=IngestOut)
def ingest(
    user: User = Depends(require_verified),
    db: Session = Depends(get_db),
) -> IngestOut:
    ent = entitlements.get_entitlement(db, user)
    file_count = _count_data_files()
    if file_count > ent.max_documents:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=(
                f"Your plan allows {ent.max_documents} documents; "
                f"{file_count} found. Upgrade to Pro to index more."
            ),
        )

    try:
        count = ingest_directory()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # embedding/vector store failure
        logger.error("Ingestion failed: %s", exc.__class__.__name__)
        raise HTTPException(
            status_code=503, detail="Ingestion failed. Check the vector store and try again."
        ) from exc

    if count == 0:
        return IngestOut(documents_ingested=0, message="No documents found to ingest.")
    return IngestOut(
        documents_ingested=count, message=f"Ingested {count} documents into the knowledge base."
    )
