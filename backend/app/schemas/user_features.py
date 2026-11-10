from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.property import PropertyOut

class WatchlistItemCreate(BaseModel):
    property_id: str
    target_price: Optional[float] = None
    notes: Optional[str] = None

class WatchlistItemOut(BaseModel):
    id: str
    user_id: str
    property_id: str
    target_price: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    property: Optional[PropertyOut] = None

    class Config:
        from_attributes = True

class AlertCreate(BaseModel):
    title: str
    locality_id: Optional[str] = None
    alert_type: str # price_drop, undervalued_opportunity, new_listing, transaction_recorded
    criteria_json: str # JSON string of filters e.g. {"max_price": 8500000, "bedrooms": 2}

class AlertOut(BaseModel):
    id: str
    user_id: str
    locality_id: Optional[str] = None
    title: str
    alert_type: str
    criteria_json: str
    is_active: bool
    created_at: datetime
    last_triggered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ComparisonWorkspaceCreate(BaseModel):
    name: str = "My Property Comparison"
    property_ids: List[str]

class ComparisonWorkspaceOut(BaseModel):
    id: str
    name: str
    property_ids: List[str]
    properties: List[PropertyOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

