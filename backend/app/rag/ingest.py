"""Ingestion: load backend/data, chunk (Unicode/CJK-aware), embed with BGE-M3,
store in ChromaDB. Uses SimpleDirectoryReader for mixed file types."""

from __future__ import annotations

import logging
from pathlib import Path

from llama_index.core import SimpleDirectoryReader

from app.rag.index import build_index

logger = logging.getLogger("app.rag")

DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def ingest_directory(path: Path | None = None) -> int:
    """Ingest all supported files under `path` (default backend/data).

    Returns the number of source documents ingested.
    """
    data_path = path or DATA_DIR
    if not data_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    files = [p for p in data_path.rglob("*") if p.is_file() and p.name != ".gitkeep"]
    if not files:
        logger.warning("No documents found in %s", data_path)
        return 0

    documents = SimpleDirectoryReader(input_dir=str(data_path), recursive=True).load_data()
    build_index(documents)
    logger.info("Ingested %d documents (%d files)", len(documents), len(files))
    return len(documents)
