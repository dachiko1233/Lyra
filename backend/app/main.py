"""FastAPI application: router registration, CORS, health check."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.config import settings
from app.payments.router import router as payments_router
from app.payments.webhook import router as webhook_router
from app.routes.chat import router as chat_router
from app.routes.ingest import router as ingest_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(
    title="Lyra — Self-hosted AI Support Agent",
    version="0.1.0",
    description="Grounded, multilingual RAG customer support.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(ingest_router)
app.include_router(payments_router)
app.include_router(webhook_router)


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
