"""previous_migration

Revision ID: 666c68d19c77
Revises:
Create Date: 2025-08-10 19:30:00.000000

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "666c68d19c77"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # This is a placeholder migration to maintain compatibility
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
