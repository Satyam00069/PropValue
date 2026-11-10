from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class PropertyTransaction(BaseModel):
    __tablename__ = "property_transactions"

    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=False, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=True, index=True)
    property_type = Column(String(50), default="apartment", nullable=False, index=True)
    residential_commercial = Column(String(20), default="residential", nullable=False)
    project_or_building_name = Column(String(200), nullable=True)
    unit_type = Column(String(50), default="2 BHK", nullable=True) # 1 BHK, 2 BHK, 3 BHK, etc.
    carpet_area_sqft = Column(Float, nullable=False, index=True)
    transacted_price = Column(Float, nullable=False, index=True) # INR
    price_per_sqft = Column(Float, nullable=False, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    
    # Legal & Provenance Attributes
    registration_office = Column(String(100), default="Haveli / Pune Sub-Registrar", nullable=True)
    document_ref = Column(String(100), nullable=True) # Masked deed ref e.g. "DOC-PN-2024-XXXX"
    data_source = Column(String(150), default="Maharashtra IGR Public Summary", nullable=False)
    verification_status = Column(String(50), default="verified", nullable=False) # verified, source_reported
    data_licence = Column(String(150), default="Maharashtra Open Public Records Notice", nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    locality = relationship("Locality", back_populates="transactions")

