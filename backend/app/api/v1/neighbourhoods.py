from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.geo import Locality, InfrastructureLocation
from app.models.property import Property
from app.models.transaction import PropertyTransaction
from app.models.business import Business
from app.schemas.geo import LocalityOut, LocalityDetailOut, InfrastructureOut

router = APIRouter()

@router.get("", response_model=List[LocalityOut])
def get_neighbourhoods(db: Session = Depends(get_db)):
    return db.query(Locality).order_by(Locality.name.asc()).all()

@router.get("/{slug_or_id}", response_model=LocalityDetailOut)
def get_neighbourhood_detail(slug_or_id: str, db: Session = Depends(get_db)):
    loc = db.query(Locality).filter(
        (Locality.id == slug_or_id) | (Locality.slug == slug_or_id.lower())
    ).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Neighbourhood not found")

    infra_items = db.query(InfrastructureLocation).filter(
        InfrastructureLocation.locality_id == loc.id
    ).all()

    total_listings = db.query(Property).filter(Property.locality_id == loc.id).count()
    total_txs = db.query(PropertyTransaction).filter(PropertyTransaction.locality_id == loc.id).count()

    return LocalityDetailOut(
        id=loc.id,
        city_id=loc.city_id,
        name=loc.name,
        slug=loc.slug,
        pincode=loc.pincode,
        latitude=loc.latitude,
        longitude=loc.longitude,
        connectivity_score=loc.connectivity_score,
        amenity_score=loc.amenity_score,
        livability_score=loc.livability_score,
        commercial_score=loc.commercial_score,
        avg_asking_price_sqft=loc.avg_asking_price_sqft,
        avg_transacted_price_sqft=loc.avg_transacted_price_sqft,
        rental_yield_pct=loc.rental_yield_pct,
        quarterly_growth_pct=loc.quarterly_growth_pct,
        business_density_per_sqkm=loc.business_density_per_sqkm,
        description=loc.description,
        boundary_geojson=loc.boundary_geojson,
        infrastructure=[InfrastructureOut.model_validate(inf) for inf in infra_items],
        total_listings=total_listings,
        total_transactions=total_txs
    )

