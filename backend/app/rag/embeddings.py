"""BGE-M3 embedding model.

BGE-M3 is multilingual (100+ languages, strong on CJK). This must never be
swapped for an English-only model (CLAUDE.md §11, hard rule). Cached so we
load the weights once per process.
"""

from __future__ import annotations

from functools import lru_cache

from huggingface_hub import snapshot_download
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from app.config import settings

# Repo files sentence-transformers never needs for the torch model — skip the
# ~2 GB ONNX weights and the repo's images so a fresh download stays lean.
_IGNORE_PATTERNS = [
    "onnx/*",
    "imgs/*",
    "*.jpg",
    "*.webp",
    "*.png",
    ".DS_Store",
    ".gitattributes",
    "README.md",
]


@lru_cache
def get_embed_model() -> HuggingFaceEmbedding:
    """Load BGE-M3 from its on-disk snapshot directory.

    We resolve the model to a local cache path and hand that *directory* to
    HuggingFaceEmbedding, instead of passing the bare "BAAI/bge-m3" hub id.
    Passing the hub id makes sentence-transformers/transformers issue HuggingFace
    HEAD requests on load to "check for updates"; when egress to huggingface.co
    is slow or blocked those calls hang for minutes-to-hours (and also break
    under HF_HUB_OFFLINE), which is what makes the first /api/chat appear to
    freeze forever. Loading from a local directory does zero hub round-trips.
    """
    try:
        # Normal case: model already in the hf-cache volume — resolve offline.
        model_dir = snapshot_download(
            settings.embed_model,
            local_files_only=True,
            ignore_patterns=_IGNORE_PATTERNS,
        )
    except Exception:
        # Fresh machine / first `make ingest`: download once (needs network),
        # then every subsequent load takes the local-only branch above.
        model_dir = snapshot_download(
            settings.embed_model,
            ignore_patterns=_IGNORE_PATTERNS,
        )
    # BGE-M3 supports very long contexts; cap to a sane multilingual chunk size.
    return HuggingFaceEmbedding(model_name=model_dir, max_length=512)
