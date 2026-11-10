from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="buyer", nullable=False) # buyer, investor, seller, broker, analyst, admin
    is_active = Column(Boolean, default=True, nullable=False)
    phone_number = Column(String(20), nullable=True)

    watchlists = relationship("WatchlistItem", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("PropertyAlert", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("ComparisonWorkspace", back_populates="user", cascade="all, delete-orphan")

