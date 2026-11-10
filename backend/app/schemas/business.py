from typing import Optional
from datetime import date
from pydantic import BaseModel

class BusinessOut(BaseModel):
    id: str
    locality_id: str
    locality_name: Optional[str] = None
    name: str
    category: str
    latitude: float
    longitude: float
    status: str
    verification_status: str
    first_seen_date: date
    last_verified_date: date
    source: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class BusinessGrowthStats(BaseModel):
    locality_name: str
    total_businesses: int
    category_breakdown: dict
    operational_count: int
    newly_mapped_count: int
    verified_operational_count: int
    growth_corridors: list

