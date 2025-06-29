# This defines the base class for all SQLAlchemy models
# All tables in DB will inherit from this Base
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, JSON

# Create a base class from which all models will inherit
Base = declarative_base()

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