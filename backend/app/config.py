"""Application settings, entirely env-driven (12-factor).

Nothing here is hardcoded per-provider: the LLM, embeddings, database,
email and payment providers are all selected via environment variables so
the exact same code runs in dev (llamafile) and prod (hosted API).
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- LLM (OpenAI-compatible) ---
    # Defaults target DeepSeek (hosted, OpenAI-compatible). Switch back to a
    # local llamafile purely via env (see .env.example) — no code change.
    llm_base_url: str = Field("https://api.deepseek.com/v1", alias="LLM_BASE_URL")
    llm_api_key: str = Field("not-needed", alias="LLM_API_KEY")
    llm_model: str = Field("deepseek-chat", alias="LLM_MODEL")
    # OpenAILike defaults context_window to 3900, which truncates RAG context.
    # DeepSeek supports 64K; override to a smaller value for tiny local models.
    llm_context_window: int = Field(64000, alias="LLM_CONTEXT_WINDOW")

    # --- Embeddings (must stay multilingual) ---
    embed_model: str = Field("BAAI/bge-m3", alias="EMBED_MODEL")

    # --- ChromaDB ---
    chroma_host: str = Field("chromadb", alias="CHROMA_HOST")
    chroma_port: int = Field(8000, alias="CHROMA_PORT")
    chroma_collection: str = Field("support_kb", alias="CHROMA_COLLECTION")

    # --- Database ---
    database_url: str = Field(
        "postgresql+psycopg://support:support@postgres:5432/support",
        alias="DATABASE_URL",
    )

    # --- Auth / JWT ---
    jwt_secret: str = Field("change-me", alias="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    access_token_minutes: int = Field(30, alias="ACCESS_TOKEN_MINUTES")
    refresh_token_days: int = Field(30, alias="REFRESH_TOKEN_DAYS")

    # --- Email (Resend) ---
    resend_api_key: str = Field("", alias="RESEND_API_KEY")
    email_from: str = Field("noreply@example.com", alias="EMAIL_FROM")
    app_url: str = Field("http://localhost:5173", alias="APP_URL")

    # --- Payments (Dodo) ---
    dodo_api_key: str = Field("", alias="DODO_API_KEY")
    dodo_webhook_secret: str = Field("", alias="DODO_WEBHOOK_SECRET")
    dodo_pro_product_id: str = Field("", alias="DODO_PRO_PRODUCT_ID")
    dodo_api_base: str = Field("https://test.dodopayments.com", alias="DODO_API_BASE")

    # --- Backend / CORS ---
    backend_port: int = Field(8000, alias="BACKEND_PORT")
    cors_origins: str = Field("http://localhost:5173", alias="CORS_ORIGINS")

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS is a comma-separated string in env."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
