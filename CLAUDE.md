# CLAUDE.md

Complete build specification for Claude Code (and other AI agents) working in
this repository. This document is the single source of truth. Build the whole
product to the standard described here — do not leave sections stubbed, mocked,
or half-finished. See **Definition of Done** at the end before considering any
task complete.

---

## 1. Product Overview

**Product:** A self-hosted **AI customer support agent** with multilingual RAG.
It answers customer questions grounded in the company's own knowledge base
(FAQs, product docs, policies), with strong support for **Asian languages and
English**. Includes user accounts, email verification, and a paid **Pro** plan.

**Who it's for:** companies that want an on-brand, self-hosted support agent that
answers only from their own documents (no hallucinated answers) and works in many
languages.

**Core promises the product must actually deliver:**
- Answers are **grounded** in the customer's docs — no made-up answers.
- Works across **100+ languages**, strong on Asian scripts (CJK, etc.).
- **Self-hosted** — the company's data stays with the company.
- Paid plans deliver **exactly** what they advertise (entitlements enforced
  server-side).

---

## 2. Full Stack

| Layer        | Choice                                                            |
|--------------|------------------------------------------------------------------|
| Frontend     | React (Vite) + TypeScript + TailwindCSS                          |
| Icons        | lucide-react                                                     |
| Backend      | Python 3.11+ + FastAPI                                           |
| RAG          | LlamaIndex                                                       |
| Vector store | ChromaDB                                                         |
| Embeddings   | BAAI **BGE-M3** (100+ languages, strong on Asian scripts)        |
| LLM          | OpenAI-compatible endpoint (dev: llamafile; prod: hosted API)    |
| Database     | PostgreSQL (Railway managed in prod)                            |
| ORM / migr.  | SQLAlchemy + Alembic                                            |
| Auth         | Email/password in our backend — argon2 hashing + JWT            |
| Email        | Resend (transactional: verification, welcome, receipts)        |
| Payments     | Dodo Payments (Pro checkout + webhooks)                         |
| Infra        | Docker + docker-compose; Makefile for tasks                     |
| Deploy       | Railway                                                          |

### LLM: dev vs prod (important)
The LLM is always an **OpenAI-compatible** endpoint, selected purely by env vars.
- **Dev:** llamafile on the host machine (`:8080`).
- **Prod:** a hosted OpenAI-compatible API (e.g. Together / Groq / OpenAI),
  because Railway has no GPU.
Backend code is identical for both — only `LLM_BASE_URL` / `LLM_API_KEY` /
`LLM_MODEL` change.

---

## 3. Repository Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/          # Nav, Hero, Logos, Features, HowItWorks,
│   │   │   │                     # Pricing, FAQ, CTA, Footer
│   │   │   ├── chat/             # ChatWindow, MessageList, MessageInput
│   │   │   ├── auth/             # RegisterForm, LoginForm, VerifyNotice
│   │   │   └── ui/               # Button, Card, Container, ThemeToggle, Accordion
│   │   ├── api/                  # backend client (fetch, JWT handling)
│   │   ├── hooks/                # useAuth, useTheme, useScrollReveal
│   │   ├── pages/                # Landing, App (chat), Login, Register, Verify
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind directives + base styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + router registration + CORS
│   │   ├── config.py             # Pydantic settings (env-driven)
│   │   ├── db/
│   │   │   ├── database.py        # engine/session
│   │   │   ├── models.py          # User, VerificationToken, Subscription, Entitlement
│   │   │   └── migrations/        # Alembic
│   │   ├── auth/
│   │   │   ├── router.py          # register, verify, login, refresh, me
│   │   │   ├── security.py        # argon2 hashing, JWT create/verify
│   │   │   └── deps.py            # get_current_user, require_verified
│   │   ├── email/
│   │   │   ├── client.py          # Resend client
│   │   │   └── templates.py       # verification, welcome, receipt (HTML)
│   │   ├── payments/
│   │   │   ├── router.py          # POST /checkout
│   │   │   ├── dodo.py            # Dodo API client
│   │   │   └── webhook.py         # POST /webhooks/dodo (verify + idempotent)
│   │   ├── entitlements/
│   │   │   ├── plans.py           # plan → limits/features mapping
│   │   │   └── service.py         # grant / read / enforce (server-side only)
│   │   ├── rag/
│   │   │   ├── index.py           # build/load LlamaIndex + Chroma
│   │   │   ├── embeddings.py      # BGE-M3
│   │   │   ├── llm.py             # OpenAI-compatible client (dev+prod)
│   │   │   └── query.py           # chat/query engine (streaming)
│   │   └── routes/
│   │       ├── chat.py            # POST /api/chat (auth + entitlement gated)
│   │       └── ingest.py          # POST /api/ingest
│   ├── data/                      # knowledge-base documents (git-ignored)
│   ├── tests/
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
├── docker-compose.yml             # frontend, backend, chromadb, postgres (dev)
├── railway.json                   # or railway.toml
├── Makefile
├── .env.example
├── .gitignore
├── README.md
└── CLAUDE.md
```

---

## 4. Landing Page (must be genuinely polished)

The landing page is a **first-class deliverable**, not an afterthought. It must
look like a real, funded startup's site — clean, modern, cohesive, responsive.
Avoid a default/template look.

### Design direction
- Modern SaaS aesthetic: generous whitespace, strong hierarchy, no clutter.
- **Intentional palette:** one primary accent + neutrals. Do NOT use default
  Tailwind blue. Subtle gradients allowed, used sparingly.
- **Typography:** a clean heading + body font pairing, configured in Tailwind.
- **Micro-interactions:** tasteful hover states, button transitions,
  fade/slide-in on scroll (Intersection Observer via a `useScrollReveal` hook).
- **Dark mode:** light default, toggle in nav, persisted in app state (Tailwind
  `dark:` classes). No browser storage APIs — keep in React state/context.
- **Responsive:** mobile-first; excellent on phone, tablet, desktop.
- **Accessible:** semantic HTML, sufficient contrast, keyboard focus states,
  alt text, aria labels on interactive elements.

### Sections (in order)
1. **Sticky nav** — logo, anchor links (Features, How it works, Pricing, FAQ),
   "Log in" + "Get started" CTA, dark-mode toggle. Collapses to a mobile menu.
2. **Hero** — bold headline, subheadline, primary + secondary CTA, and a visual:
   a mock chat window showing a multilingual Q&A (e.g. a question in an Asian
   language answered with a cited, grounded response). Trust line underneath.
3. **Logo strip** — placeholder company logos ("Trusted by teams at…").
4. **Features grid** — 6 cards with lucide icons:
   Multilingual RAG · Grounded answers (no hallucination) · Self-hosted, your
   data · Accounts + email verification · Fast setup (Docker + Railway) ·
   Per-plan usage limits.
5. **How it works** — 3 numbered steps with a simple diagram:
   Upload your docs → Deploy → Customers get grounded answers.
6. **Pricing** — two tiers:
   - **Free** — limited messages/day, basic features.
   - **Pro** — higher limits, priority, more documents. Highlighted card.
   Price shown as a **placeholder (e.g. `$XX/mo`)** — easy to change in one
   place. Add a small note: "Pro entitlements are enforced server-side."
7. **FAQ** — accordion, 5–6 real questions: languages supported, self-hosting &
   data privacy, how grounding works, how billing works, how to deploy.
8. **Final CTA banner** — headline + "Get started" button.
9. **Footer** — links, small print, copyright.

### Copy
Write concise, convincing marketing copy for **this exact product** — no lorem
ipsum. Lead with the multilingual + grounded-answers angle.

### Technical
- One component per section under `components/landing/`, composed in the Landing
  page. Reusable `Button`, `Card`, `Container` in `components/ui/`.
- Smooth scroll for nav anchor links.
- No backend calls required for the landing page itself; CTAs route to
  `/register` and `/login`.

---

## 5. Backend Features

### Auth (email/password)
- `POST /api/auth/register {email, password}` → create user (`is_verified=false`),
  argon2-hash password, create verification token, send verification email.
- `GET /api/auth/verify?token=…` → validate (exists, unused, unexpired), set
  `is_verified=true`, mark token used, send welcome email.
- `POST /api/auth/login` → allowed **only if verified**; return access + refresh JWT.
- `POST /api/auth/refresh` → new access token from refresh token.
- `GET /api/auth/me` → current user + plan + entitlements.

### Email (Resend)
- Verification email with link `{APP_URL}/verify?token=…`.
- Welcome email on successful verification.
- Receipt email on successful payment (optional but preferred).
- HTML templates, multilingual-friendly (UTF-8), no secrets in logs.

### Payments (Dodo) + Entitlements
- `POST /api/payments/checkout` (authenticated) → create Dodo checkout session
  for `DODO_PRO_PRODUCT_ID`, return checkout URL.
- `POST /api/webhooks/dodo` → **verify signature** with `DODO_WEBHOOK_SECRET`,
  reject if invalid, be **idempotent** (Dodo retries):
  - `subscription.active` / `payment.succeeded` → upsert subscription, set
    `users.plan='pro'`, grant Pro entitlements.
  - `subscription.canceled` / `past_due` → downgrade to free, reset entitlements.
- **Entitlements are the "Pro must actually deliver" guarantee.** They are read
  and enforced **server-side** on every gated request. The frontend is never
  trusted for limits/features. Webhook + DB is the single source of truth.

### RAG chat
- `POST /api/chat` (auth + entitlement gated: verified, plan, daily limit) →
  LlamaIndex chat engine: BGE-M3 embeds query → ChromaDB retrieves top-k →
  prompt (context + query) → LLM → **streamed** grounded answer.
- Prefer "I don't have that information" over hallucinating on empty retrieval.
- `POST /api/ingest` → load `backend/data/`, chunk (Unicode/CJK-aware), embed
  with BGE-M3, store in ChromaDB.

---

## 6. Database Schema

```
users
  id (uuid, pk)
  email (unique, indexed)
  password_hash            # argon2
  is_verified (bool, default false)
  plan (enum: free|pro, default free)
  created_at

verification_tokens
  token (pk)               # random, single-use
  user_id (fk users)
  expires_at               # e.g. 24h
  used_at (nullable)

subscriptions
  id (pk)
  user_id (fk users)
  dodo_subscription_id (unique)
  status (active|canceled|past_due)
  plan (pro)
  current_period_end

entitlements
  user_id (fk users, pk)
  max_messages_per_day
  max_documents
  priority (bool)
  # extend per plan as needed
```

---

## 7. Environment Variables (.env.example)

```
# --- LLM (OpenAI-compatible) ---
# Dev (llamafile on host):
LLM_BASE_URL=http://host.docker.internal:8080/v1
LLM_API_KEY=not-needed
LLM_MODEL=local-model
# Prod (set in Railway): hosted provider base URL + real key + model

# --- Embeddings ---
EMBED_MODEL=BAAI/bge-m3

# --- ChromaDB ---
CHROMA_HOST=chromadb
CHROMA_PORT=8000
CHROMA_COLLECTION=support_kb

# --- Database ---
DATABASE_URL=postgresql+psycopg://user:pass@postgres:5432/support

# --- Auth / JWT ---
JWT_SECRET=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_DAYS=30

# --- Email (Resend) ---
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
APP_URL=http://localhost:5173

# --- Payments (Dodo) ---
DODO_API_KEY=xxxxx
DODO_WEBHOOK_SECRET=whsec_xxxxx
DODO_PRO_PRODUCT_ID=prod_xxxxx

# --- Backend / CORS ---
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:5173

# --- Frontend ---
VITE_API_BASE_URL=http://localhost:8000
```

---

## 8. Connecting llamafile (dev)

1. Start it on the host in server mode:
   ```
   ./your-model.llamafile --server --host 0.0.0.0 --port 8080 --nobrowser
   ```
   `--host 0.0.0.0` is **required** so the Docker container can reach it.
2. Verify: `curl http://localhost:8080/v1/models`.
3. Backend reaches it via `LLM_BASE_URL=http://host.docker.internal:8080/v1`.
4. **Linux only:** add to the backend service in docker-compose:
   ```
   extra_hosts:
     - "host.docker.internal:host-gateway"
   ```
5. LlamaIndex client:
   ```python
   from llama_index.llms.openai_like import OpenAILike
   llm = OpenAILike(
       model=settings.LLM_MODEL,
       api_base=settings.LLM_BASE_URL,
       api_key=settings.LLM_API_KEY,
       is_chat_model=True,
   )
   ```
Start llamafile **before** the backend, or connection errors occur.

---

## 9. Railway Deployment

- **Services:** backend, frontend, chromadb (persistent volume), Railway managed
  **PostgreSQL**.
- **LLM:** do NOT run llamafile on Railway. Set `LLM_BASE_URL` / `LLM_API_KEY` /
  `LLM_MODEL` to a hosted OpenAI-compatible provider in Railway variables.
- **Secrets:** all in Railway variables; nothing committed. Reference Railway's
  `DATABASE_URL` for the backend.
- **Migrations:** run `alembic upgrade head` as a release command on deploy.
- **Dodo webhook:** point to `https://<backend-domain>/api/webhooks/dodo`; set
  `DODO_WEBHOOK_SECRET`.
- **Resend:** verify sending domain; set `EMAIL_FROM`; set `APP_URL` to the
  deployed frontend URL so verification links are correct.
- **CORS:** set `CORS_ORIGINS` to the deployed frontend domain.

---

## 10. Makefile Targets

```
make build      # build all docker images
make up         # start dev services (detached)
make down       # stop and remove containers
make logs       # tail logs
make ingest     # ingest documents into ChromaDB
make migrate    # alembic upgrade head
make revision   # create a new alembic migration
make fmt        # ruff + prettier
make lint       # lint backend + frontend
make test       # run backend tests
make clean      # remove volumes and build artifacts
```

---

## 11. Conventions & Constraints (hard rules)

- **Multilingual is non-negotiable.** Never replace BGE-M3 with an English-only
  embedding model. Chunking must be Unicode/CJK-aware (no whitespace assumption).
- **LLM swapped via env only** — no provider name, URL, port, or model hardcoded.
- **Never trust the frontend** for plans, limits, or entitlements. Enforce
  server-side from the DB on every gated request.
- **Always verify the Dodo webhook signature**; reject on mismatch; handlers
  idempotent.
- **Passwords:** argon2 (or bcrypt) only. **Never log** passwords, tokens, JWTs,
  API keys, or webhook secrets.
- **Verification tokens:** single-use, expiring, cryptographically random.
- **Unverified accounts** cannot log in or call `/api/chat`.
- **All secrets from env.** `.env` git-ignored; commit `.env.example`.
- **Backend:** type hints everywhere, Pydantic models, ruff, SQLAlchemy + Alembic.
- **Frontend:** TS strict mode, functional components + hooks, Tailwind utilities.
- **No browser storage APIs** in the frontend for auth state during dev artifacts;
  keep session in memory/context (real deployment can use httpOnly cookies).
- **RAG answers must be grounded**; prefer honest "I don't know" over guessing.
- **Streaming** on `/api/chat`.
- **Errors handled gracefully** everywhere (LLM down, Chroma empty, email/payment
  provider errors) with clear messages, no crashes, no leaked secrets.

---

## 12. Local Development

1. Start llamafile on host (see §8).
2. `cp .env.example .env`; fill Resend + Dodo keys.
3. `make build && make up`
4. `make migrate`
5. Put KB files in `backend/data/`, then `make ingest`.
6. Open `http://localhost:5173`; register → verify via emailed link → log in → chat.

---

## 13. Definition of Done

A task is complete only when ALL of the following hold. Do not stop early.

- [ ] Frontend builds and runs (`npm install && npm run dev`) with no errors.
- [ ] Landing page is fully implemented, polished, responsive, dark-mode capable,
      with real copy and all 9 sections — not a stub or a template look.
- [ ] Backend runs; all routes in §5 exist and work end to end.
- [ ] Registration → verification email → verify → login flow works.
- [ ] Dodo checkout → webhook (signature-verified) → plan upgraded → entitlements
      granted → enforced server-side on `/api/chat`.
- [ ] RAG returns grounded, streamed answers in English AND at least one Asian
      language, using BGE-M3 + ChromaDB.
- [ ] `docker-compose up` starts frontend, backend, chromadb, postgres; migrations
      applied; ingestion works.
- [ ] llamafile connects in dev via `host.docker.internal` (Linux caveat noted).
- [ ] `.env.example`, Makefile, Dockerfiles, Alembic migrations, and README all
      present and correct.
- [ ] No secrets committed; nothing sensitive logged.
- [ ] Code is clean, typed, commented where non-obvious, and free of dead/mocked
      placeholders (except the clearly-marked Pro price placeholder).

## 14. Notes for the Agent

- Use LlamaIndex `SimpleDirectoryReader` for mixed file types in `backend/data/`.
- Keep the ChromaDB collection name in sync with `CHROMA_COLLECTION`.
- Do not commit `.env`, `backend/data/` contents, or Chroma/Postgres volumes.
- Test email + payment flows in Resend/Dodo test modes before prod.
- Build in a sensible order: scaffold → DB/models/migrations → auth → email →
  RAG/chat → payments/entitlements → landing page → docker/compose → Railway →
  polish. Verify each layer before moving on.
