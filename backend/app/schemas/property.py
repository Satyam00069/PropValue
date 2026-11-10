from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel

class PropertyImageOut(BaseModel):
    id: str
    image_url: str
    caption: Optional[str] = None
    is_primary: bool

    class Config:
        from_attributes = True

class ListingOut(BaseModel):
    id: str
    asking_price: float
    price_per_sqft: float
    status: str
    source_type: str
    source_name: str
    source_url: Optional[str] = None
    listed_date: date
    last_verified_date: datetime
    verification_status: str

    class Config:
        from_attributes = True

class PropertyOut(BaseModel):
    id: str
    title: str
    property_type: str
    residential_commercial: str
    address: str
    locality_id: str
    locality_name: Optional[str] = None
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    carpet_area_sqft: float
    builtup_area_sqft: Optional[float] = None
    plot_area_sqft: Optional[float] = None
    bedrooms: int
    bathrooms: int
    floor_number: int
    total_floors: int
    furnishing: str
    parking_count: int
    age_years: int
    building_condition: str
    road_width_ft: float
    amenities: Optional[str] = None
    
    # Active listing data
    asking_price: Optional[float] = None
    price_per_sqft: Optional[float] = None
    listing_id: Optional[str] = None
    verification_status: Optional[str] = None
    source_name: Optional[str] = None
    last_verified_date: Optional[datetime] = None
    primary_image: Optional[str] = None
    
    # AI Valuation & Fair Price metrics
    estimated_value: Optional[float] = None
    fair_price_status: Optional[str] = None # Undervalued, Fairly priced, Slightly overpriced, Overpriced, Insufficient data
    price_difference_pct: Optional[float] = None

    class Config:
        from_attributes = True

class PropertyDetailOut(PropertyOut):
    description: Optional[str] = None
    balconies: int = 1
    facing: Optional[str] = "East"
    images: List[PropertyImageOut] = []
    listings: List[ListingOut] = []
    comparables: List[dict] = []
    nearby_amenities: List[dict] = []
    nearby_businesses: List[dict] = []
    rental_yield_estimate: Optional[float] = None
    investment_score: Optional[float] = None

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str
    residential_commercial: str = "residential"
    address: str
    locality_id: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    carpet_area_sqft: float
    builtup_area_sqft: Optional[float] = None
    bedrooms: int
    bathrooms: int
    floor_number: int = 1
    total_floors: int = 10
    furnishing: str = "unfurnished"
    parking_count: int = 1
    age_years: int = 3
    building_condition: str = "good"
    road_width_ft: float = 30.0
    amenities: Optional[str] = None
    asking_price: float
    source_type: str = "owner"
    source_name: str = "Direct User Submission"

