# ============================================================
#  Makefile — dev task runner
# ============================================================
.DEFAULT_GOAL := help
COMPOSE := docker compose

.PHONY: help build up down logs ingest migrate revision fmt lint test clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

build: ## Build all docker images
	$(COMPOSE) build

up: ## Start dev services (detached)
	$(COMPOSE) up -d

down: ## Stop and remove containers
	$(COMPOSE) down

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

ingest: ## Ingest documents from backend/data into ChromaDB
	$(COMPOSE) exec backend python -m app.rag.ingest_cli

migrate: ## Apply DB migrations (alembic upgrade head)
	$(COMPOSE) exec backend alembic upgrade head

revision: ## Create a new alembic migration: make revision m="message"
	$(COMPOSE) exec backend alembic revision --autogenerate -m "$(m)"

fmt: ## Format backend (ruff) + frontend (prettier)
	$(COMPOSE) exec backend ruff format app
	cd frontend && npm run format

lint: ## Lint backend (ruff) + frontend (eslint/tsc)
	$(COMPOSE) exec backend ruff check app
	cd frontend && npm run lint

test: ## Run backend tests
	$(COMPOSE) exec backend pytest -q

clean: ## Remove volumes and build artifacts
	$(COMPOSE) down -v
	rm -rf frontend/dist frontend/node_modules
	find backend -type d -name __pycache__ -prune -exec rm -rf {} +
