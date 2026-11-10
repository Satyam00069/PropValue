from typing import Optional
from datetime import date
from pydantic import BaseModel

class TransactionOut(BaseModel):
    id: str
    locality_id: str
    locality_name: Optional[str] = None
    property_type: str
    residential_commercial: str
    project_or_building_name: Optional[str] = None
    unit_type: Optional[str] = None
    carpet_area_sqft: float
    transacted_price: float
    price_per_sqft: float
    transaction_date: date
    registration_office: Optional[str] = None
    document_ref: Optional[str] = None
    data_source: str
    verification_status: str
    data_licence: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class TransactionStatsOut(BaseModel):
    total_transactions: int
    avg_price_sqft: float
    min_price_sqft: float
    max_price_sqft: float
    median_price: float
    last_updated_date: Optional[date] = None

