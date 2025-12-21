#!/bin/bash
set -e

echo "Starting worker entrypoint..."

# Extract database connection info from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

# Wait for database to be ready
echo "Waiting for database at $DB_HOST..."
until PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "  Database is unavailable - sleeping"
  sleep 2
done
echo "✓ Database is ready"

# Wait for migrations to be applied (check for alembic_version table with a version)
echo ""
echo "Waiting for migrations to complete..."
until PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM alembic_version LIMIT 1" 2>/dev/null | grep -q "1"; do
  echo "  Migrations not yet applied - sleeping"
  sleep 3
done
echo "✓ Migrations complete"

echo ""
echo "Starting worker..."
exec "$@"
