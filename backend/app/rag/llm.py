"""OpenAI-compatible LLM client — identical code for dev (llamafile) and prod
(hosted API). Only env vars differ (CLAUDE.md §8/§11)."""

from __future__ import annotations

from functools import lru_cache

from llama_index.llms.openai_like import OpenAILike

from app.config import settings


@lru_cache
def get_llm() -> OpenAILike:
    return OpenAILike(
        model=settings.llm_model,
        api_base=settings.llm_base_url,
        api_key=settings.llm_api_key,
        is_chat_model=True,
        context_window=settings.llm_context_window,  # avoid 3900 default truncating RAG context
        temperature=0.1,  # grounded, low-creativity answers
        timeout=120,
        max_tokens=1024,
    )
