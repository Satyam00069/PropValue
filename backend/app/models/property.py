from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Property(BaseModel):
    __tablename__ = "properties"

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    property_type = Column(String(50), nullable=False, index=True) # apartment, villa, independent_house, plot, office, shop
    residential_commercial = Column(String(20), default="residential", nullable=False, index=True) # residential, commercial
    address = Column(Text, nullable=False)
    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=False, index=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    # Dimensions & Specifications
    carpet_area_sqft = Column(Float, nullable=False, index=True)
    builtup_area_sqft = Column(Float, nullable=True)
    plot_area_sqft = Column(Float, nullable=True)
    bedrooms = Column(Integer, default=2, nullable=False, index=True)
    bathrooms = Column(Integer, default=2, nullable=False)
    balconies = Column(Integer, default=1, nullable=False)
    floor_number = Column(Integer, default=1, nullable=False)
    total_floors = Column(Integer, default=10, nullable=False)
    furnishing = Column(String(50), default="unfurnished", nullable=False) # unfurnished, semi_furnished, furnished
    parking_count = Column(Integer, default=1, nullable=False)
    age_years = Column(Integer, default=3, nullable=False)
    building_condition = Column(String(50), default="good", nullable=False) # new, good, fair, needs_renovation
    road_width_ft = Column(Float, default=30.0, nullable=False)
    facing = Column(String(20), default="East", nullable=True)
    amenities = Column(Text, nullable=True) # Comma-separated or JSON list of amenities (e.g. "Clubhouse,Swimming Pool,Gym,Power Backup,Security")
    
    # Relationships
    locality = relationship("Locality", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="property", cascade="all, delete-orphan")
    valuations = relationship("Valuation", back_populates="property", cascade="all, delete-orphan")
    watchlist_items = relationship("WatchlistItem", back_populates="property", cascade="all, delete-orphan")

class PropertyImage(BaseModel):
    __tablename__ = "property_images"

    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)

    property = relationship("Property", back_populates="images")

