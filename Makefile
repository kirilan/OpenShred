.PHONY: help setup install install-dev install-pip dev test lint format build up down logs clean migrate db-shell pre-commit sync-requirements

help:
	@echo "Data Deletion Assistant - Development Commands"
	@echo ""
	@echo "====== Docker (Recommended) ======"
	@echo "  make dev           Start development environment (Docker)"
	@echo "  make build         Build Docker images"
	@echo "  make up            Start all services"
	@echo "  make down          Stop all services"
	@echo "  make logs          View container logs"
	@echo "  make clean         Remove containers and volumes"
	@echo ""
	@echo "====== Local System Setup ======"
	@echo "  make setup         Complete local setup (env, deps, pre-commit)"
	@echo "  make install       Install backend dependencies (uv)"
	@echo "  make install-dev   Install all local dependencies (backend + frontend)"
	@echo "  make install-pip   Install backend via pip (alternative to uv)"
	@echo "  make sync-requirements  Regenerate requirements.txt from pyproject.toml"
	@echo ""
	@echo "====== Local System Development ======"
	@echo "  make run-backend   Run backend locally (requires local deps)"
	@echo "  make run-worker    Run Celery worker locally"
	@echo "  make run-beat      Run Celery beat locally"
	@echo ""
	@echo "====== Database ======"
	@echo "  make migrate       Run Alembic migrations"
	@echo "  make migrate-new   Create new migration (m='description')"
	@echo "  make db-shell      Open PostgreSQL shell (Docker)"
	@echo ""
	@echo "====== Testing & Quality ======"
	@echo "  make test          Run backend tests"
	@echo "  make test-cov      Run backend tests with coverage"
	@echo "  make test-frontend Run frontend tests"
	@echo "  make test-frontend-watch  Run frontend tests in watch mode"
	@echo "  make test-frontend-cov    Run frontend tests with coverage"
	@echo "  make test-all      Run all tests (backend + frontend)"
	@echo "  make lint          Run all linters via pre-commit"
	@echo "  make format        Format code via pre-commit"
	@echo "  make check         Run all checks (lint + tests)"

# ============ Docker (Recommended) ============

dev: up
	@echo ""
	@echo "Development environment started:"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API Docs: http://localhost:8000/docs"

# ============ Local System Setup ============

setup: .env install-dev pre-commit-install
	@echo ""
	@echo "Local setup complete! Run 'make dev' to start Docker environment."

.env:
	@if [ ! -f .env ]; then \
		echo "Creating .env from .env.example..."; \
		cp .env.example .env; \
	fi

install:
	cd backend && uv sync

install-dev:
	cd backend && uv sync --all-extras
	cd frontend && npm install

pre-commit-install:
	@if command -v pre-commit > /dev/null; then \
		pre-commit install; \
	else \
		echo "pre-commit not installed. Install with: pip install pre-commit"; \
	fi

# Alternative: install via pip instead of uv
install-pip:
	cd backend && pip install -r requirements.txt

install-pip-dev:
	cd backend && pip install -r requirements-dev.txt

# Sync requirements.txt files from pyproject.toml (source of truth)
sync-requirements:
	@echo "Syncing requirements from pyproject.toml..."
	@cd backend && uv pip compile pyproject.toml -o requirements.txt --quiet
	@cd backend && uv pip compile pyproject.toml --extra dev -o requirements-dev.txt --quiet
	@echo "Updated backend/requirements.txt and backend/requirements-dev.txt"

# ============ Local System Development ============

run-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

run-worker:
	cd backend && uv run celery -A app.celery_app worker --loglevel=info

run-beat:
	cd backend && uv run celery -A app.celery_app beat --loglevel=info

# ============ Docker Commands ============

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-worker:
	docker compose logs -f celery-worker

clean:
	docker compose down -v --remove-orphans

restart:
	docker compose restart

# ============ Database ============

migrate:
	cd backend && uv run alembic upgrade head

migrate-new:
	cd backend && uv run alembic revision --autogenerate -m "$(m)"

migrate-down:
	cd backend && uv run alembic downgrade -1

migrate-history:
	cd backend && uv run alembic history

db-shell:
	docker compose exec db psql -U postgres -d antispam

db-reset:
	docker compose down -v
	docker compose up -d db redis
	@sleep 3
	docker compose up -d

# ============ Testing & Quality ============

test:
	cd backend && uv run pytest

test-v:
	cd backend && uv run pytest -v

test-cov:
	cd backend && uv run pytest --cov=app --cov-report=term-missing

test-frontend:
	cd frontend && npm run test:run

test-frontend-watch:
	cd frontend && npm run test

test-frontend-cov:
	cd frontend && npm run test:coverage

test-all: test test-frontend

lint:
	pre-commit run --all-files

format:
	pre-commit run ruff-format --all-files
	pre-commit run ruff --all-files

check: lint test-all
