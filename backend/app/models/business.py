from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Date, BigInteger, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Business(BaseModel):
    __tablename__ = "businesses"

    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True) # restaurant, cafe, supermarket, hospital, school, it_company, bank, gym, retail
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    status = Column(String(50), default="operational", nullable=False) # operational, confirmed_closed
    osm_id = Column(BigInteger, nullable=True)
    verification_status = Column(String(50), default="confirmed_operational", nullable=False) # newly_mapped, confirmed_operational, verified
    first_seen_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    last_verified_date = Column(Date, default=lambda: datetime.now(timezone.utc).date(), nullable=False)
    source = Column(String(100), default="OpenStreetMap ODbL Verified", nullable=False)
    notes = Column(Text, nullable=True)

    locality = relationship("Locality", back_populates="businesses")

