from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from db.base import Base
from db.user.models import User
from db.lore_piece.models import LorePiece

class UserSelectedLore(Base):
    __tablename__ = "user_selected_lore"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    lore_piece_id = Column(Integer, ForeignKey("lore_pieces.id"), nullable=False)

    selected_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to enable ORM navigation
    user = relationship("User", back_populates="selected_lore")
    lore_piece = relationship("LorePiece", back_populates="selected_by_users", lazy="raise")
