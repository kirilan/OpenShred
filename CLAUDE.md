# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenShred is a GDPR/CCPA data deletion automation platform with a FastAPI backend, React/TypeScript frontend, and Celery task queue. The system scans Gmail for data broker emails, generates deletion requests, and tracks broker responses.

## Development Commands

### Quick Start with Makefile

The project includes a Makefile for common development tasks:

```bash
make help              # Show all available commands
make dev               # Start Docker development environment
make test              # Run backend tests
make test-all          # Run backend + frontend tests
make test-cov          # Run backend tests with coverage
make lint              # Run all linters via pre-commit
make format            # Format code (ruff + prettier)
make check             # Run lint + test (full validation)
```

### Backend (using uv - recommended)

**uv** is a modern Python package manager (10-100x faster than pip). Install: `curl -LsSf https://astral.sh/uv/install.sh | sh`

```bash
# Install dependencies
cd backend
uv sync --all-extras

# Run backend (uv manages venv automatically)
uv run uvicorn app.main:app --reload --port 8000

# Run tests
uv run pytest
uv run pytest --cov=app --cov-report=term-missing

# Run Celery worker
uv run celery -A app.celery_app worker --loglevel=info

# Run Celery beat
uv run celery -A app.celery_app beat --loglevel=info

# Lint & format
uv run ruff check app tests
uv run ruff format app tests
```

Alternative (using pip):
```bash
cd backend
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                # Runs on port 5173 by default
npm run build              # TypeScript compilation + Vite build
npm run lint               # ESLint
npm test                   # Run tests in watch mode
npm run test:run           # Run tests once
npm run test:coverage      # Run tests with coverage
```

### Docker Compose

Development environment (localhost only, no reverse proxy):
```bash
docker compose up --build
# Or: make dev
```

Production environment (with Caddy reverse proxy + TLS):
```bash
# Set ENVIRONMENT=production in .env first
docker compose --profile production up -d --build
```

Services started by docker-compose:
- `db` - PostgreSQL 15 (port 5432)
- `redis` - Redis 7 (port 6379)
- `backend` - FastAPI (port 8000)
- `celery-worker` - Background task processor
- `celery-beat` - Scheduled task scheduler
- `frontend` - React SPA via Nginx (port 3000)
- `caddy` - Reverse proxy (production profile only)

## Architecture

### Request Flow

1. **Authentication**: Users authenticate via Gmail OAuth2. Tokens are encrypted with Fernet and stored in PostgreSQL.
2. **Email Scanning**: `EmailScanner` service scans Gmail inbox, `BrokerDetector` classifies emails by domain/keywords.
3. **Deletion Requests**: Users create requests from UI → FastAPI endpoint → `deletion_request_service` generates GDPR/CCPA email → sent via Gmail API.
4. **Response Tracking**: Hourly Celery Beat task triggers `scan_all_users_for_responses` → checks Gmail for broker replies → `ResponseDetector` classifies response type → `ResponseMatcher` links replies to requests → updates request status.
5. **Analytics**: `analytics_service` computes success rates, response times, broker compliance scores from database aggregates.

### Key Service Layers

**Backend (`backend/app/`):**
- `api/` - FastAPI route handlers (auth, brokers, emails, requests, responses, analytics, ai, admin)
- `services/` - Business logic layer:
  - `gmail_service.py` - Gmail API OAuth + email operations
  - `email_scanner.py` - Inbox scanning logic
  - `broker_detector.py` - Email-to-broker classification
  - `deletion_request_service.py` - Request CRUD + email generation
  - `response_detector.py` - Response type classification (confirmation, rejection, etc.)
  - `response_matcher.py` - Matches responses to deletion requests by thread/domain
  - `analytics_service.py` - Metrics aggregation
  - `gemini_service.py` - AI-assisted response classification
  - `rate_limiter.py` - Per-user rate limiting
  - `activity_log_service.py` - User activity tracking
- `tasks/email_tasks.py` - Celery tasks for background processing
- `models/` - SQLAlchemy ORM models (user, data_broker, email_scan, deletion_request, broker_response, activity_log)
- `schemas/` - Pydantic validation schemas
- `dependencies/auth.py` - JWT authentication dependencies

**Frontend (`frontend/src/`):**
- `components/` - React components organized by feature (auth, dashboard, emails, brokers, requests, responses, analytics)
- `hooks/` - Custom React hooks for API calls (useAuth, useEmails, useBrokers, useRequests, useResponses, useAnalytics)
- `services/api.ts` - Axios client with JWT interceptor
- `stores/authStore.ts` - Zustand auth state management
- `types/` - TypeScript type definitions

### Database Schema

Uses SQLAlchemy with `Base.metadata.create_all()` on startup (`init_db()` in `database.py`). For production, migrate to Alembic. Key tables:
- `users` - OAuth tokens (encrypted), email, admin flag, Gemini API key
- `data_brokers` - Broker info (domains, privacy email, opt-out URL)
- `email_scans` - Inbox scan results
- `deletion_requests` - GDPR/CCPA requests with status tracking
- `broker_responses` - Detected responses with type classification
- `activity_log` - Audit trail of user actions

### Background Tasks

Celery Beat schedule (`backend/app/celery_app.py`):
- `scan-responses-hourly` - Runs `scan_all_users_for_responses` task at top of every hour (development default; change to daily by replacing `crontab(minute=0)` with `crontab(hour=0, minute=0)`)

Task retry configuration:
- Tasks use `task_acks_late=True` and `task_reject_on_worker_lost=True` for reliability
- `scan_inbox_task` retries twice (2min, 10min intervals) on failure

### Authentication & Authorization

- JWT tokens issued after OAuth callback (`/auth/callback`)
- All API endpoints protected by `get_current_user` dependency (from `dependencies/auth.py`)
- Admin-only endpoints use `get_current_admin_user` dependency
- Tokens encrypted at rest using `ENCRYPTION_KEY` (Fernet)
- Admin promotion: manually set `is_admin=true` in database and re-authenticate

### Environment Configuration

Required `.env` variables (see `.env.example`):
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Database: `DATABASE_URL` (PostgreSQL connection string)
- Redis: `REDIS_URL`
- Security: `SECRET_KEY` (JWT signing), `ENCRYPTION_KEY` (Fernet token encryption)
- URLs: `FRONTEND_URL`, `VITE_API_URL`
- Environment: `ENVIRONMENT` (development/production)
- Production only: `APP_HOSTNAME`, `API_HOSTNAME`, `CADDY_ACME_EMAIL`

Generate security keys:
```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# ENCRYPTION_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Rate Limiting

Per-user rate limits configured in `backend/app/config.py`:
- Email scans: 5/hour (configurable via `email_scan_rate_limit`)
- Response scans: 5/hour
- Task triggers: 8/hour

Uses Redis-backed sliding window counter (`rate_limiter.py`).

## Important Implementation Details

### OAuth Token Handling

OAuth tokens are encrypted before database storage. When refreshing expired tokens, the `GmailService` automatically exchanges refresh tokens and updates user record. If refresh fails (expired/revoked), user must re-authenticate.

### Response Detection & Matching

`ResponseDetector` uses keyword/pattern matching to classify broker replies into 5 types: confirmation, rejection, acknowledgment, info_request, unknown. Confidence score ≥0.75 required for auto-status updates.

`ResponseMatcher` links responses to deletion requests using:
1. Gmail thread ID matching
2. Domain + date range heuristics
3. Email subject pattern matching

### AI Assist (Gemini)

Users can configure Gemini API key in Settings. AI Assist reclassifies responses using structured JSON output. Only updates status if model returns valid JSON with confidence ≥0.75. Logs to activity feed with source="ai_assist".

### Data Broker Management

Brokers seeded from `backend/data/data_brokers.json` via "Sync Brokers" button. Manual broker entry available in UI. Duplicate detection by domain to prevent re-adding known brokers.

### CORS & Production Deployment

CORS origins configured via `settings.cors_origins` (list of allowed origins). Defaults to `["http://localhost:3000", "http://localhost:5173"]` for development. In production, set `CORS_ORIGINS` env var to restrict access. Caddy handles TLS termination and forwards to backend/frontend services.

## Testing

### Backend Tests (pytest)

Test suite located in `backend/tests/` using pytest with SQLite in-memory database:

```bash
# Run all tests
make test
# Or: cd backend && uv run pytest

# Run with coverage
make test-cov
# Or: cd backend && uv run pytest --cov=app --cov-report=term-missing

# Run specific test file
cd backend
uv run pytest tests/test_brokers.py -v
```

**Test Structure:**
- `conftest.py` - Fixtures for database, users, brokers, auth headers
- `test_brokers.py` - Broker CRUD endpoint tests
- `test_services.py` - Service layer tests
- `test_email_templates.py` - Email template generation tests
- `test_health.py` - Health endpoint tests

**Key Fixtures:**
- `db` - Fresh SQLite in-memory database per test
- `client` - FastAPI TestClient with database override
- `test_user` / `admin_user` - Test user accounts
- `auth_headers` / `admin_auth_headers` - JWT auth headers
- `test_broker` - Sample data broker

### Frontend Tests (Vitest + React Testing Library)

Test suite located in `frontend/src/` using Vitest:

```bash
# Run tests in watch mode
cd frontend
npm test

# Run tests once
npm run test:run
# Or: make test-frontend

# Run with coverage
npm run test:coverage
# Or: make test-frontend-cov
```

**Test Structure:**
- `src/hooks/__tests__/` - Hook tests (useAuth, useBrokers, useRequests, useAnalytics)
- `src/stores/__tests__/` - Zustand store tests (authStore, rateLimitStore)
- `src/components/__tests__/` - Component tests (AuthGuard, ErrorBoundary, LoginPage)
- `src/test/` - Test utilities and mocks

**Test Utilities:**
- `test/setup.ts` - Global test configuration
- `test/utils.tsx` - `createQueryWrapper` for TanStack Query tests
- `test/mocks/handlers.ts` - MSW request handlers
- `test/mocks/server.ts` - MSW server setup

### Running All Tests

```bash
make test-all  # Backend + Frontend
make check     # Lint + Test (full validation)
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push to main and PRs:

### Jobs

1. **backend-lint** - Ruff linting and formatting check
2. **backend-test** - pytest with coverage upload to Codecov
3. **frontend-lint** - ESLint + TypeScript type checking
4. **frontend-test** - Vitest with coverage upload to Codecov
5. **frontend-build** - Production build verification
6. **docker-build** - Docker image build test

### Running CI Checks Locally

```bash
# Full CI validation
make check

# Individual checks
make lint          # Pre-commit hooks (ruff, ESLint, gitleaks)
make test          # Backend tests
make test-frontend # Frontend tests
make format        # Auto-format code
```

### Pre-commit Hooks

Install pre-commit hooks to run checks automatically before commits:

```bash
pip install pre-commit
pre-commit install

# Run manually on all files
pre-commit run --all-files
# Or: make lint
```

**Hooks:**
- Ruff (Python linting + formatting)
- ESLint (TypeScript/React linting)
- TypeScript type checking
- Trailing whitespace/EOF fixer
- YAML/JSON validation
- Gitleaks (secret detection)
- Large file detection

## Database Migrations

The project uses **Alembic** for database schema management. See `MIGRATION_GUIDE.md` for detailed migration instructions.

### Common Commands

```bash
# Apply all pending migrations
make migrate
# Or: cd backend && alembic upgrade head

# Create new migration
make migrate-new m="description"
# Or: cd backend && alembic revision --autogenerate -m "description"

# Rollback one migration
make migrate-down
# Or: cd backend && alembic downgrade -1

# Check current version
cd backend && alembic current

# View migration history
cd backend && alembic history
```

### For Existing Deployments

If upgrading from the old SQL migration system, follow `MIGRATION_GUIDE.md` for transition instructions. In short:
1. Backup database
2. Mark Alembic initial migration as applied: `alembic stamp 4c191330a96c`
3. Future migrations use Alembic

## Common Debugging

- **OAuth failures**: Check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` match Google Cloud Console settings
- **Celery tasks stuck**: Check Redis connection, inspect Celery worker logs, use admin task queue health widget
- **Database migrations**: Use Alembic (`make migrate`). See `MIGRATION_GUIDE.md` for troubleshooting. Check current version: `alembic current`
- **Migration errors**: If "table already exists", see `MIGRATION_GUIDE.md` Option 2 to stamp existing schema
- **Rate limit errors**: Check Redis, adjust limits in `config.py`, or clear Redis keys: `redis-cli KEYS "rate_limit:*"`
- **Gmail API quota**: Google imposes daily quotas. Check quota usage in Google Cloud Console. Task includes retry logic with exponential backoff
- **Test failures**: Ensure using SQLite for tests (automatic in conftest.py). Run `make test-cov` to see coverage

## Code Style & Patterns

- Backend follows service layer pattern: routes delegate to services, services contain business logic
- Frontend uses TanStack Query for server state, Zustand for client state
- Pydantic schemas for request/response validation
- SQLAlchemy models use declarative base
- Celery tasks return structured results for frontend polling
