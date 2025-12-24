# Repository Guidelines

## Project Structure & Module Organization
- `backend/app/` holds the FastAPI app, Celery tasks, services, and API routes; `backend/tests/` contains pytest tests; `backend/alembic/` stores migrations; `backend/data/` includes broker seed data.
- `frontend/src/` contains the React + TypeScript UI; tests live under `frontend/src/**/__tests__/` with utilities in `frontend/src/test/`.
- `docs/` captures design/plan docs; `scripts/` holds automation; `docker-compose*.yml` defines local/prod stacks; `Makefile` provides common commands.

## Build, Test, and Development Commands
Preferred workflow is Docker:
- `make dev` starts the full stack (backend, frontend, worker, redis, db).
- `make build`, `make up`, `make down`, `make logs` manage Docker images and containers.
- `make db-shell` opens a PostgreSQL shell inside the Docker DB.
Host-run tests and checks:
- `make test`, `make test-cov`, `make test-frontend`, `make test-all`.
- `make lint`, `make format`, `make check` run pre-commit linting/formatting and full validation.
Local alternatives (only if not using Docker):
- `make run-backend`, `make run-worker`, `make run-beat` run services with `uv`.
- `cd frontend && npm run dev` or `npm run build`.

## Coding Style & Naming Conventions
- Python: `ruff` + `ruff-format` (line length 100, double quotes). Use snake_case modules like `gmail_service.py`.
- TypeScript/React: ESLint + `npm run typecheck`; component files are generally PascalCase (e.g., `AuthGuard.tsx`), with lowercase primitives in `components/ui/`.
- Run `pre-commit` before committing; it enforces lint, formatting, and gitleaks checks.

## Testing Guidelines
- Backend: pytest in `backend/tests/` using `test_*.py`; run `make test` or `make test-cov`.
- Frontend: Vitest + React Testing Library + MSW in `frontend/src/**/__tests__/` with `.test.ts(x)`; run `make test-frontend` or `npm run test:coverage`.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `style:`, `test:`) with optional scopes (e.g., `feat(ci): ...`).
- PRs should include a brief summary, tests run, and link related issues; add screenshots for UI changes. Ensure CI and pre-commit hooks pass.

## Security & Configuration Tips
- Copy `.env.example` to `.env`; keep secrets out of git (gitleaks runs in pre-commit).
- Backend targets Python 3.11–3.12; use `uv` or `pip` per `backend/pyproject.toml` and `backend/requirements*.txt`.
