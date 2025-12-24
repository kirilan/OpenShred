"""add action_required statuses

Revision ID: b2d7a6c8a4f0
Revises: 1f3d0c2b4b8e
Create Date: 2025-12-24 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2d7a6c8a4f0"
down_revision: str | None = "1f3d0c2b4b8e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE responsetype ADD VALUE IF NOT EXISTS 'action_required'")
    op.execute("ALTER TYPE requeststatus ADD VALUE IF NOT EXISTS 'ACTION_REQUIRED'")


def downgrade() -> None:
    op.execute(
        "UPDATE broker_responses SET response_type = 'request_info' "
        "WHERE response_type = 'action_required'"
    )
    op.execute("UPDATE deletion_requests SET status = 'SENT' WHERE status = 'ACTION_REQUIRED'")

    op.execute("ALTER TYPE responsetype RENAME TO responsetype_old")
    op.execute(
        "CREATE TYPE responsetype AS ENUM "
        "('confirmation', 'rejection', 'acknowledgment', 'request_info', 'unknown')"
    )
    op.execute(
        "ALTER TABLE broker_responses "
        "ALTER COLUMN response_type "
        "TYPE responsetype USING response_type::text::responsetype"
    )
    op.execute("DROP TYPE responsetype_old")

    op.execute("ALTER TYPE requeststatus RENAME TO requeststatus_old")
    op.execute("CREATE TYPE requeststatus AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'REJECTED')")
    op.execute(
        "ALTER TABLE deletion_requests "
        "ALTER COLUMN status "
        "TYPE requeststatus USING status::text::requeststatus"
    )
    op.execute("DROP TYPE requeststatus_old")
