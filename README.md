# Lyra — Self-hosted AI Customer Support Agent

A self-hosted AI customer support agent with **multilingual RAG**. It answers
customer questions grounded in *your own* knowledge base (FAQs, product docs,
policies), across **100+ languages** with strong support for Asian scripts —
and says *"I don't have that information"* rather than hallucinating.

> **Note on the name:** "Lyra" is a working name used throughout the UI and
> emails. Replace it with your own brand where you like.

## Stack

| Layer        | Choice                                                        |
|--------------|---------------------------------------------------------------|
| Frontend     | React (Vite) + TypeScript + TailwindCSS + lucide-react        |
| Backend      | Python 3.11+ + FastAPI                                         |
| RAG          | LlamaIndex + ChromaDB + BAAI **BGE-M3** embeddings            |
| LLM          | Any **OpenAI-compatible** endpoint (dev: llamafile; prod: hosted) |
| Database     | PostgreSQL + SQLAlchemy + Alembic                             |
| Auth         | Email/password, **argon2** hashing + JWT                     |
| Email        | Resend (verification, welcome, receipts)                     |
| Payments     | Dodo Payments (Pro checkout + signature-verified webhooks)   |
| Infra        | Docker Compose + Makefile; deploy to Railway                 |

---

## Quick start (local dev)

### 1. Start a llamafile on the host (the dev LLM)
```bash
./your-model.llamafile --server --host 0.0.0.0 --port 8080 --nobrowser
# verify:
curl http://localhost:8080/v1/models
```
`--host 0.0.0.0` is **required** so the backend container can reach it. On
Linux the backend uses `host.docker.internal` (wired via `extra_hosts` in
`docker-compose.yml`). Start llamafile **before** the backend.

### 2. Configure env
```bash
cp .env.example .env
# fill in RESEND_API_KEY, DODO_* keys, and a strong JWT_SECRET
```

### 3. Build & run
```bash
make build
make up          # frontend :5173, backend :8000, chromadb :8001, postgres :5432
make migrate     # alembic upgrade head (also runs automatically on backend start)
```

### 4. Add your knowledge base and ingest
```bash
# put .md / .txt / .pdf / .docx files in backend/data/  (git-ignored)
make ingest
```
Sample docs (English + Japanese) are included in `backend/data/` to try it out.

### 5. Use it
Open <http://localhost:5173> → **Register** → click the verification link in the
email → **Log in** → chat. Ask a question in English, then in Japanese.

---

## Make targets

```
make build      # build all docker images
make up         # start dev services (detached)
make down       # stop and remove containers
make logs       # tail logs
make ingest     # ingest backend/data into ChromaDB
make migrate    # alembic upgrade head
make revision   # new migration:  make revision m="add x"
make fmt        # ruff format + prettier
make lint       # ruff check + tsc
make test       # backend tests
make clean      # remove volumes and build artifacts
```

---

## Backend API

| Method | Path                     | Auth      | Purpose                                   |
|--------|--------------------------|-----------|-------------------------------------------|
| POST   | `/api/auth/register`     | –         | Create user (unverified), send verify email |
| GET    | `/api/auth/verify`       | –         | Validate token, verify user, send welcome |
| POST   | `/api/auth/login`        | –         | Login (verified only) → access + refresh  |
| POST   | `/api/auth/refresh`      | refresh   | New access token                          |
| GET    | `/api/auth/me`           | access    | User + plan + entitlements                |
| POST   | `/api/chat`              | verified  | Streamed, grounded answer (gated by limit)|
| POST   | `/api/ingest`            | verified  | Ingest `backend/data` into ChromaDB       |
| POST   | `/api/payments/checkout` | verified  | Create Dodo Pro checkout, return URL      |
| POST   | `/api/webhooks/dodo`     | signature | Upgrade/downgrade plan (idempotent)       |
| GET    | `/api/health`            | –         | Health check                              |

### How entitlements work (the "Pro must actually deliver" guarantee)
Plans map to concrete limits in `app/entitlements/plans.py`. Every gated request
reads the user's entitlement **from the database** and enforces it server-side.
The frontend is never trusted. A Dodo webhook (signature-verified, idempotent)
is the single source of truth for upgrades/downgrades.

---

## Dev vs prod LLM

The LLM is always an OpenAI-compatible endpoint chosen by env vars — the backend
code is identical either way:

```
# dev (llamafile on host)
LLM_BASE_URL=http://host.docker.internal:8080/v1
LLM_API_KEY=not-needed
LLM_MODEL=local-model

# prod (Railway) — e.g. Together / Groq / OpenAI
LLM_BASE_URL=https://api.together.xyz/v1
LLM_API_KEY=<real key>
LLM_MODEL=<hosted model>
```

---

## Deploy to Railway

- Services: **backend**, **frontend** (build target `prod`), **chromadb**
  (persistent volume), Railway managed **PostgreSQL**.
- Do **not** run llamafile on Railway (no GPU) — set `LLM_BASE_URL` /
  `LLM_API_KEY` / `LLM_MODEL` to a hosted provider in Railway variables.
- Migrations run as the release command: `alembic upgrade head` (see
  `railway.json`).
- Point the Dodo webhook to `https://<backend-domain>/api/webhooks/dodo` and set
  `DODO_WEBHOOK_SECRET`.
- Verify your Resend sending domain; set `EMAIL_FROM` and `APP_URL` (the deployed
  frontend URL) so verification links resolve.
- Set `CORS_ORIGINS` to the deployed frontend domain.

---

## Security & conventions (hard rules)

- **Multilingual is non-negotiable** — BGE-M3 stays; chunking is Unicode/CJK-aware.
- **LLM swapped via env only** — no provider/URL/model hardcoded.
- **Never trust the frontend** for plans, limits, or entitlements.
- **Always verify the Dodo webhook signature**; handlers are idempotent.
- **argon2** password hashing; verification tokens are single-use and expiring.
- **Unverified accounts** cannot log in or call `/api/chat`.
- **Never log** passwords, tokens, JWTs, API keys, or webhook secrets.
- **All secrets from env**; `.env` is git-ignored, `.env.example` is committed.
- **Grounded answers** — honest "I don't know" over guessing; `/api/chat` streams.

---

## Tests

```bash
cd backend
pytest -q          # security (argon2/JWT), plan mapping, webhook signature
```
