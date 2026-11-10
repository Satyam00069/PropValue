from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ValuationRequest(BaseModel):
    locality_id: str
    property_type: str = "apartment" # apartment, villa, independent_house, plot, office, shop
    carpet_area_sqft: float = Field(..., gt=50, lt=50000, description="Carpet area in square feet")
    builtup_area_sqft: Optional[float] = None
    bedrooms: int = Field(2, ge=0, le=20)
    bathrooms: int = Field(2, ge=1, le=20)
    floor_number: int = Field(1, ge=0, le=100)
    total_floors: int = Field(10, ge=1, le=100)
    property_age_years: int = Field(3, ge=0, le=100)
    furnishing: str = "unfurnished" # unfurnished, semi_furnished, furnished
    parking_count: int = Field(1, ge=0, le=10)
    building_condition: str = "good" # new, good, fair, needs_renovation
    road_width_ft: float = Field(30.0, ge=10, le=300)
    amenities: Optional[str] = "Clubhouse,Gym,Security"
    distance_to_metro_km: Optional[float] = 1.2
    asking_price: Optional[float] = None # Optional asking price to calculate Fair Price

class ExplanationItem(BaseModel):
    feature_name: str
    feature_value: str
    shap_value: float # Impact in INR
    impact_direction: str # "positive", "negative", "neutral"
    explanation_text: str

class ComparableItem(BaseModel):
    title: str
    distance_meters: float
    similarity_score: float # 0.0 - 1.0
    price: float
    price_per_sqft: float
    carpet_area_sqft: float
    bedrooms: float
    record_type: str # verified_transaction or active_listing
    source: str

class FairPriceAssessment(BaseModel):
    asking_price: float
    estimated_value: float
    difference_rupees: float
    difference_percentage: float
    status: str # "Undervalued", "Fairly priced", "Slightly overpriced", "Overpriced", "Insufficient data"
    explanation: str
    comparable_range_low: float
    comparable_range_high: float

class ValuationResponse(BaseModel):
    valuation_id: str
    locality_name: str
    estimated_value: float
    estimated_low: float
    estimated_high: float
    estimated_price_sqft: float
    locality_benchmark_sqft: float
    confidence_score: float
    confidence_label: str # "High", "Moderate", "Preliminary"
    valuation_date: datetime
    model_version: str
    model_type: str
    explanations: List[ExplanationItem]
    comparables: List[ComparableItem]
    fair_price: Optional[FairPriceAssessment] = None
    data_freshness_note: str

class FairPriceAnalysisRequest(BaseModel):
    property_id: Optional[str] = None
    locality_id: str
    asking_price: float
    carpet_area_sqft: float
    property_type: str = "apartment"
    bedrooms: int = 2
    property_age_years: int = 3

