"""Build / load the LlamaIndex vector index backed by ChromaDB.

The collection name is kept in sync with CHROMA_COLLECTION. Chunking is
Unicode/CJK-aware: we use a sentence splitter with a token limit rather than
whitespace splitting, so Chinese/Japanese/Thai (no spaces) chunk correctly.
"""

from __future__ import annotations

import logging
from functools import lru_cache

import chromadb
from llama_index.core import Settings as LlamaSettings
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.chroma import ChromaVectorStore

from app.config import settings
from app.rag.embeddings import get_embed_model
from app.rag.llm import get_llm

logger = logging.getLogger("app.rag")


@lru_cache
def _chroma_client() -> chromadb.api.ClientAPI:
    return chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)


def _configure_llama() -> None:
    """Wire our embed model + LLM into LlamaIndex global settings once."""
    LlamaSettings.embed_model = get_embed_model()
    LlamaSettings.llm = get_llm()
    # Token-based splitter — does not assume whitespace word boundaries.
    LlamaSettings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=64)


def get_vector_store() -> ChromaVectorStore:
    client = _chroma_client()
    collection = client.get_or_create_collection(settings.chroma_collection)
    return ChromaVectorStore(chroma_collection=collection)


def get_index() -> VectorStoreIndex:
    """Load the index over the existing Chroma collection (read path)."""
    _configure_llama()
    vector_store = get_vector_store()
    return VectorStoreIndex.from_vector_store(vector_store)


def build_index(documents) -> VectorStoreIndex:  # type: ignore[no-untyped-def]
    """(Re)build the index from documents (ingest path)."""
    _configure_llama()
    vector_store = get_vector_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    return VectorStoreIndex.from_documents(
        documents, storage_context=storage_context, show_progress=True
    )


def collection_size() -> int:
    """Number of stored chunks — used to detect an empty KB."""
    try:
        client = _chroma_client()
        return client.get_or_create_collection(settings.chroma_collection).count()
    except Exception as exc:  # chroma down — treat as empty, caller degrades gracefully
        logger.warning("Could not read Chroma collection count: %s", exc.__class__.__name__)
        return 0
