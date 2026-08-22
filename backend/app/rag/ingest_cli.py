"""CLI entrypoint for `make ingest` — run inside the backend container."""

from __future__ import annotations

import logging
import sys

from app.rag.ingest import ingest_directory

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def main() -> int:
    count = ingest_directory()
    if count == 0:
        print("No documents ingested. Add files to backend/data/ first.")
        return 1
    print(f"Ingested {count} documents into ChromaDB.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
