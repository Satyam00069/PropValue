from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class City(BaseModel):
    __tablename__ = "cities"

    name = Column(String(100), unique=True, index=True, nullable=False) # e.g. Pune
    state = Column(String(100), default="Maharashtra", nullable=False)
    country = Column(String(100), default="India", nullable=False)
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)

    localities = relationship("Locality", back_populates="city", cascade="all, delete-orphan")

class Locality(BaseModel):
    __tablename__ = "localities"

    city_id = Column(String(36), ForeignKey("cities.id"), nullable=False, index=True)
    name = Column(String(100), index=True, nullable=False) # Hinjawadi, Wakad, Baner, Kharadi, etc.
    pincode = Column(String(10), nullable=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    boundary_geojson = Column(Text, nullable=True) # GeoJSON boundary polygon string

    # Analytics & Scores (0.0 to 10.0 scale)
    connectivity_score = Column(Float, default=7.5, nullable=False)
    amenity_score = Column(Float, default=7.5, nullable=False)
    livability_score = Column(Float, default=7.5, nullable=False)
    commercial_score = Column(Float, default=7.0, nullable=False)
    
    # Financial Benchmarks
    avg_asking_price_sqft = Column(Float, default=7500.0, nullable=False)
    avg_transacted_price_sqft = Column(Float, default=7100.0, nullable=False)
    rental_yield_pct = Column(Float, default=3.8, nullable=False)
    quarterly_growth_pct = Column(Float, default=2.1, nullable=False)
    business_density_per_sqkm = Column(Float, default=45.0, nullable=False)
    description = Column(Text, nullable=True)

    city = relationship("City", back_populates="localities")
    properties = relationship("Property", back_populates="locality")
    transactions = relationship("PropertyTransaction", back_populates="locality")
    infrastructure = relationship("InfrastructureLocation", back_populates="locality")
    businesses = relationship("Business", back_populates="locality")

class InfrastructureLocation(BaseModel):
    __tablename__ = "infrastructure_locations"

    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False) # e.g. "Hinjawadi Metro Station", "Ruby Hall Clinic"
    category = Column(String(50), nullable=False, index=True) # metro_station, highway, school, hospital, it_park, mall, park
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="operational", nullable=False) # operational, under_construction, proposed
    source = Column(String(100), default="OSM_Verified", nullable=False)

    locality = relationship("Locality", back_populates="infrastructure")

