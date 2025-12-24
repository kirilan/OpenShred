"""add request_deleted activity type

Revision ID: c3f7d9a2a1e4
Revises: b2d7a6c8a4f0
Create Date: 2025-12-24 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c3f7d9a2a1e4"
down_revision: str | None = "b2d7a6c8a4f0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE activitytype ADD VALUE IF NOT EXISTS 'request_deleted'")


def downgrade() -> None:
    op.execute(
        "UPDATE activity_logs SET activity_type = 'info' "
        "WHERE activity_type = 'request_deleted'"
    )
    op.execute("ALTER TYPE activitytype RENAME TO activitytype_old")
    op.execute(
        "CREATE TYPE activitytype AS ENUM "
        "('request_created', 'request_sent', 'response_received', "
        "'response_scanned', 'email_scanned', 'broker_detected', "
        "'error', 'warning', 'info')"
    )
    op.execute(
        "ALTER TABLE activity_logs "
        "ALTER COLUMN activity_type "
        "TYPE activitytype USING activity_type::text::activitytype"
    )
    op.execute("DROP TYPE activitytype_old")
