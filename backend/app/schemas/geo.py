from typing import Optional, List
from pydantic import BaseModel

class CityOut(BaseModel):
    id: str
    name: str
    state: str
    country: str
    center_latitude: float
    center_longitude: float

    class Config:
        from_attributes = True

class InfrastructureOut(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float
    status: str
    source: str

    class Config:
        from_attributes = True

class LocalityOut(BaseModel):
    id: str
    city_id: str
    name: str
    slug: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    connectivity_score: float
    amenity_score: float
    livability_score: float
    commercial_score: float
    avg_asking_price_sqft: float
    avg_transacted_price_sqft: float
    rental_yield_pct: float
    quarterly_growth_pct: float
    business_density_per_sqkm: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class LocalityDetailOut(LocalityOut):
    boundary_geojson: Optional[str] = None
    infrastructure: List[InfrastructureOut] = []
    total_listings: int = 0
    total_transactions: int = 0

