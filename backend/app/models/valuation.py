from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Valuation(BaseModel):
    __tablename__ = "valuations"

    property_id = Column(String(36), ForeignKey("properties.id"), nullable=True, index=True)
    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=False, index=True)
    
    # Valuation Output
    estimated_value = Column(Float, nullable=False, index=True) # INR
    estimated_low = Column(Float, nullable=False) # INR (10th percentile)
    estimated_high = Column(Float, nullable=False) # INR (90th percentile)
    estimated_price_sqft = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.88, nullable=False) # 0.0 to 1.0 calibrated confidence
    
    # Model Metadata
    model_version = Column(String(50), default="LightGBM_Hedonic_v1.2", nullable=False)
    model_type = Column(String(50), default="Supervised Gradient Boosted Ensemble", nullable=False)
    valuation_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    inputs_json = Column(Text, nullable=False) # Stored input attributes

    property = relationship("Property", back_populates="valuations")
    explanations = relationship("ValuationExplanation", back_populates="valuation", cascade="all, delete-orphan")
    comparables = relationship("ComparableProperty", back_populates="valuation", cascade="all, delete-orphan")

class ValuationExplanation(BaseModel):
    __tablename__ = "valuation_explanations"

    valuation_id = Column(String(36), ForeignKey("valuations.id"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False) # e.g. "Carpet Area", "Floor Number", "Proximity to Metro"
    feature_value = Column(String(100), nullable=False) # e.g. "1150 sqft", "Floor 8", "0.6 km"
    shap_value = Column(Float, nullable=False) # Impact in INR (can be positive or negative)
    impact_direction = Column(String(20), nullable=False) # "positive", "negative", "neutral"
    explanation_text = Column(Text, nullable=False)

    valuation = relationship("Valuation", back_populates="explanations")

class ComparableProperty(BaseModel):
    __tablename__ = "comparable_properties"

    valuation_id = Column(String(36), ForeignKey("valuations.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    distance_meters = Column(Float, nullable=False)
    similarity_score = Column(Float, nullable=False) # 0.0 to 1.0
    price = Column(Float, nullable=False)
    price_per_sqft = Column(Float, nullable=False)
    carpet_area_sqft = Column(Float, nullable=False)
    bedrooms = Column(Float, nullable=False)
    record_type = Column(String(50), default="verified_transaction", nullable=False) # verified_transaction or active_listing
    source = Column(String(100), nullable=False)

    valuation = relationship("Valuation", back_populates="comparables")

