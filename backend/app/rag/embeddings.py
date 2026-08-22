"""BGE-M3 embedding model.

BGE-M3 is multilingual (100+ languages, strong on CJK). This must never be
swapped for an English-only model (CLAUDE.md §11, hard rule). Cached so we
load the weights once per process.
"""

from __future__ import annotations

from functools import lru_cache

from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from app.config import settings


@lru_cache
def get_embed_model() -> HuggingFaceEmbedding:
    # BGE-M3 supports very long contexts; cap to a sane multilingual chunk size.
    return HuggingFaceEmbedding(model_name=settings.embed_model, max_length=512)
