# Database Migration Guide

This guide helps you transition from the old SQL migration system to Alembic migrations introduced in PR #3.

## For New Deployments

If you're deploying OpenShred for the first time, simply use Alembic:

```bash
# Using Docker (recommended)
docker compose up --build

# Or using Makefile
make dev

# Or manually
cd backend
alembic upgrade head
```

The backend entrypoint automatically runs migrations on startup.

## For Existing Deployments

If you already have a running deployment with the old SQL migration system (`backend/migrations/*.sql`), follow these steps to transition to Alembic.

### Option 1: Fresh Start (Recommended for Development)

**⚠️ WARNING: This deletes all data!**

```bash
# Stop services and remove volumes
docker compose down -v

# Pull latest changes
git pull origin main

# Start fresh with Alembic
docker compose up --build
```

This is the simplest approach for development/testing environments where data loss is acceptable.

### Option 2: Transition Existing Database (Production)

For production deployments where you need to preserve data:

#### Step 1: Backup Your Database

```bash
# Backup PostgreSQL database
docker compose exec db pg_dump -U postgres -d antispam > backup_$(date +%Y%m%d).sql
```

#### Step 2: Mark Old Migrations as Applied

The Alembic initial migration (`4c191330a96c_initial_schema.py`) creates the same schema as the old SQL migrations. To prevent Alembic from trying to recreate existing tables:

```bash
# Connect to your database
docker compose exec db psql -U postgres -d antispam

# Check if you have the old migrations table
SELECT * FROM schema_migrations ORDER BY applied_at;

# Exit psql
\q
```

If you have all 5 old migrations applied (001 through 005), your database schema matches the Alembic initial migration. You need to tell Alembic to skip it:

```bash
# Access backend container
docker compose exec backend bash

# Mark the initial migration as applied (don't actually run it)
alembic stamp 4c191330a96c

# Exit container
exit
```

#### Step 3: Update and Restart

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up --build
```

The backend will now use Alembic for future migrations.

#### Step 4: Verify

```bash
# Check Alembic migration status
docker compose exec backend alembic current

# Should show: 4c191330a96c (head)
```

### Option 3: Manual Migration Path

If you're between old migrations (not all 5 applied), you have two options:

#### A. Complete Old Migrations First

```bash
# Complete old migrations
docker compose exec backend python migrations/run_migrations.py

# Then follow Option 2
```

#### B. Fresh Alembic + Data Export/Import

1. Export your data (users, brokers, requests, etc.)
2. Drop and recreate database with Alembic
3. Import your data

This is more complex but gives you a clean Alembic-managed schema.

## Verification

After migration, verify everything works:

```bash
# Check Alembic status
docker compose exec backend alembic current

# Check tables exist
docker compose exec db psql -U postgres -d antispam -c "\dt"

# Check application health
curl http://localhost:8000/health
```

Expected tables:
- `users`
- `data_brokers`
- `email_scans`
- `deletion_requests`
- `broker_responses`
- `activity_logs`
- `alembic_version` (Alembic tracking table)

You may also see `schema_migrations` (old tracking table) - this can be safely ignored or dropped after successful migration.

## Future Migrations

With Alembic in place, creating new migrations is standardized:

```bash
# Create a new migration
make migrate-new m="description of change"

# Or manually:
cd backend
alembic revision --autogenerate -m "description of change"

# Review the generated migration file in alembic/versions/

# Apply migrations
make migrate
# Or: alembic upgrade head
```

## Rolling Back Migrations

Alembic supports downgrades:

```bash
# Downgrade one migration
make migrate-down

# Or manually:
alembic downgrade -1

# Or to specific version:
alembic downgrade <revision_id>
```

## Troubleshooting

### Error: "Table already exists"

Your database has existing tables but Alembic doesn't know about them. Follow **Option 2** above to stamp the initial migration.

### Error: "Alembic table not found"

Alembic hasn't been initialized. Run:

```bash
alembic upgrade head
```

### Migration Conflicts

If you have local migrations that conflict with upstream:

```bash
# Check current state
alembic current

# View migration history
alembic history

# If stuck, you can reset to a specific version:
alembic stamp <revision_id>
```

### Starting Over

If migrations are completely broken and you want to start fresh:

```bash
# ⚠️ DELETES ALL DATA
docker compose down -v
docker compose up --build
```

## Key Differences: Old vs New System

| Feature | Old SQL Migrations | Alembic (New) |
|---------|-------------------|---------------|
| Migration files | `backend/migrations/*.sql` | `backend/alembic/versions/*.py` |
| Tracking table | `schema_migrations` | `alembic_version` |
| Auto-run on startup | Yes (via entrypoint.sh) | Yes (via entrypoint.sh) |
| Rollback support | No | Yes (`alembic downgrade`) |
| Auto-generation | No (manual SQL) | Yes (`alembic revision --autogenerate`) |
| Version control | Filename numbering | Git-friendly revision IDs |

## Questions?

- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **Issues**: Open a GitHub issue with the tag `database-migration`
- **Makefile Help**: Run `make help` to see all database commands
