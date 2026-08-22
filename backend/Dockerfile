# Python 3.11 (spec baseline; has wheels for the full RAG stack)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/root/.cache/huggingface

WORKDIR /app

# Build deps for native wheels (argon2, psycopg, chroma, torch bits)
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install CPU-only torch first so the transitive deps (sentence-transformers,
# transformers, FlagEmbedding) don't pull multi-GB CUDA wheels. Railway/most
# hosts have no GPU, and CPU inference is fine for embeddings at this scale.
RUN pip install --upgrade pip \
    && pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 \
    && pip install -r requirements.txt

COPY . .

EXPOSE 8000

# Compose/Railway override the command; this is a sensible default.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
