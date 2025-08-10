"""initial_schema

Revision ID: 7f1e2bc1c0a1
Revises: 05dbf88625a6
Create Date: 2025-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f1e2bc1c0a1"
down_revision: Union[str, Sequence[str], None] = "05dbf88625a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True, nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False, unique=True),
    )
    # Index on id (PK is indexed implicitly, but reflect model's index=True)
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- lore_pieces ---
    op.create_table(
        "lore_pieces",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("theme", sa.String(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=True),
    )
    op.create_index("ix_lore_pieces_id", "lore_pieces", ["id"], unique=False)
    op.create_index("ix_lore_pieces_type", "lore_pieces", ["type"], unique=False)
    op.create_index("ix_lore_pieces_theme", "lore_pieces", ["theme"], unique=False)

    # --- user_selected_lore ---
    op.create_table(
        "user_selected_lore",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "lore_piece_id", sa.Integer(), sa.ForeignKey("lore_pieces.id"), nullable=False
        ),
        sa.Column("selected_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_user_selected_lore_id", "user_selected_lore", ["id"], unique=False)
    op.create_index(
        "ix_user_selected_lore_user_id", "user_selected_lore", ["user_id"], unique=False
    )
    op.create_index(
        "ix_user_selected_lore_lore_piece_id",
        "user_selected_lore",
        ["lore_piece_id"],
        unique=False,
    )



def downgrade() -> None:
    op.drop_index("ix_user_selected_lore_lore_piece_id", table_name="user_selected_lore")
    op.drop_index("ix_user_selected_lore_user_id", table_name="user_selected_lore")
    op.drop_index("ix_user_selected_lore_id", table_name="user_selected_lore")
    op.drop_table("user_selected_lore")

    op.drop_index("ix_lore_pieces_theme", table_name="lore_pieces")
    op.drop_index("ix_lore_pieces_type", table_name="lore_pieces")
    op.drop_index("ix_lore_pieces_id", table_name="lore_pieces")
    op.drop_table("lore_pieces")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
