from sqlalchemy import JSON, Column, Integer, String
from sqlalchemy.orm import relationship

from db.base import Base

# Describe the table structure for lore pieces in the database

# This class represents a table in database called 'lore_pieces'
# It will store the actual lore pieces
class LorePiece(Base):
    __tablename__ = "lore_pieces"  # Name of the table in the database

    # Primary key ID for the record
    id = Column(Integer, primary_key=True, index=True)

    # Name of the lore piece
    name = Column(String, nullable=False)

    # Description paragraph (rich text)
    description = Column(String, nullable=False)

    # Lore type: "character", "faction", "setting", etc
    type = Column(String, nullable=False)

    # Theme: "post-apocalyptic", "fantasy", etc
    theme = Column(String, nullable=False)

    # Details dictionary stored as JSON (e.g. {"appearance": "...", "ideology": "..."})
    # This lets us store flexible nested data without creating extra tables
    details = Column(JSON, nullable=True)

    selected_by_users = relationship("UserSelectedLore", back_populates="lore_piece", cascade="all, delete-orphan")