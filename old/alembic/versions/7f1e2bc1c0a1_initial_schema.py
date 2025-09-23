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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_index(table: str, name: str) -> bool:
        try:
            return any(ix.get("name") == name for ix in inspector.get_indexes(table))
        except Exception:
            return False

    # --- users ---
    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.String(), primary_key=True, nullable=False),
            sa.Column("hashed_password", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False, unique=True),
        )
    # Avoid redundant PK/email indexes; rely on PK and unique constraint

    # --- lore_pieces ---
    if not inspector.has_table("lore_pieces"):
        op.create_table(
            "lore_pieces",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("description", sa.String(), nullable=False),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("theme", sa.String(), nullable=False),
            sa.Column("details", sa.JSON(), nullable=True),
        )
    # Create helpful lookup indexes if missing
    if inspector.has_table("lore_pieces") and not has_index(
        "lore_pieces", "ix_lore_pieces_type"
    ):
        op.create_index("ix_lore_pieces_type", "lore_pieces", ["type"], unique=False)
    if inspector.has_table("lore_pieces") and not has_index(
        "lore_pieces", "ix_lore_pieces_theme"
    ):
        op.create_index("ix_lore_pieces_theme", "lore_pieces", ["theme"], unique=False)

    # --- user_selected_lore ---
    if not inspector.has_table("user_selected_lore"):
        op.create_table(
            "user_selected_lore",
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column(
                "user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False
            ),
            sa.Column(
                "lore_piece_id",
                sa.Integer(),
                sa.ForeignKey("lore_pieces.id"),
                nullable=False,
            ),
            sa.Column(
                "selected_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
            ),
        )
    if inspector.has_table("user_selected_lore") and not has_index(
        "user_selected_lore", "ix_user_selected_lore_user_id"
    ):
        op.create_index(
            "ix_user_selected_lore_user_id",
            "user_selected_lore",
            ["user_id"],
            unique=False,
        )
    if inspector.has_table("user_selected_lore") and not has_index(
        "user_selected_lore", "ix_user_selected_lore_lore_piece_id"
    ):
        op.create_index(
            "ix_user_selected_lore_lore_piece_id",
            "user_selected_lore",
            ["lore_piece_id"],
            unique=False,
        )


def downgrade() -> None:
    # Drop in reverse order; guard with inspector to avoid errors if absent
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("user_selected_lore"):
        try:
            op.drop_index(
                "ix_user_selected_lore_lore_piece_id", table_name="user_selected_lore"
            )
        except Exception:
            pass
        try:
            op.drop_index(
                "ix_user_selected_lore_user_id", table_name="user_selected_lore"
            )
        except Exception:
            pass
        op.drop_table("user_selected_lore")

    if inspector.has_table("lore_pieces"):
        try:
            op.drop_index("ix_lore_pieces_theme", table_name="lore_pieces")
        except Exception:
            pass
        try:
            op.drop_index("ix_lore_pieces_type", table_name="lore_pieces")
        except Exception:
            pass
        op.drop_table("lore_pieces")

    if inspector.has_table("users"):
        # no extra indexes to drop; PK & unique constraint will be dropped with table
        op.drop_table("users")
