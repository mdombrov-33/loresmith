from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from db.base import Base

# Describe the table structure for user in the database

# This class represents a table in database called "user"
# It will store the actual user
class User(Base):
    __tablename__ = "users"  # Name of the table in the database

    # Primary key ID for the record
    id = Column(String, primary_key=True, index=True)

    # Name of user
    username = Column(String, nullable=True)

    # Email of the user
    email = Column(String, unique=True, nullable=False)

    selected_lore = relationship("UserSelectedLore", back_populates="user", cascade="all, delete-orphan")