from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Listing(BaseModel):
    __tablename__ = "listings"

    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    asking_price = Column(Float, nullable=False, index=True) # INR
    price_per_sqft = Column(Float, nullable=False, index=True) # INR per sqft
    status = Column(String(50), default="active", nullable=False, index=True) # active, pending, sold, expired, unverified
    source_type = Column(String(50), default="owner", nullable=False) # broker, owner, developer, portal_partner
    source_name = Column(String(100), default="Direct Verified", nullable=False)
    source_ref_id = Column(String(100), nullable=True)
    source_url = Column(String(500), nullable=True)
    listed_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    last_verified_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    verification_status = Column(String(50), default="verified", nullable=False) # verified, source_reported, user_submitted, stale
    verification_notes = Column(Text, nullable=True)

    property = relationship("Property", back_populates="listings")
    price_history = relationship("ListingPriceHistory", back_populates="listing", cascade="all, delete-orphan")

class ListingPriceHistory(BaseModel):
    __tablename__ = "listing_price_history"

    listing_id = Column(String(36), ForeignKey("listings.id"), nullable=False, index=True)
    previous_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    change_reason = Column(String(200), nullable=True)

    listing = relationship("Listing", back_populates="price_history")

