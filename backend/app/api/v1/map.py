from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.models.listing import Listing
from app.models.transaction import PropertyTransaction
from app.models.business import Business
from app.models.geo import Locality, InfrastructureLocation

router = APIRouter()

@router.get("/properties")
def get_map_properties(
    db: Session = Depends(get_db),
    locality: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    bedrooms: Optional[int] = Query(None)
):
    query = db.query(Property).join(Listing).filter(Listing.status == "active")
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )
    if min_price:
        query = query.filter(Listing.asking_price >= min_price)
    if max_price:
        query = query.filter(Listing.asking_price <= max_price)
    if bedrooms:
        query = query.filter(Property.bedrooms == bedrooms)

    properties = query.limit(200).all()

    features = []
    for p in properties:
        active_listing = next((l for l in p.listings if l.status == "active"), None)
        if not active_listing:
            continue
        primary_img = p.images[0].image_url if p.images else None

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [p.longitude, p.latitude]
            },
            "properties": {
                "id": p.id,
                "title": p.title,
                "property_type": p.property_type,
                "bedrooms": p.bedrooms,
                "bathrooms": p.bathrooms,
                "carpet_area_sqft": p.carpet_area_sqft,
                "asking_price": active_listing.asking_price,
                "price_per_sqft": active_listing.price_per_sqft,
                "locality_name": p.locality.name if p.locality else "",
                "verification_status": active_listing.verification_status,
                "image_url": primary_img
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/transactions")
def get_map_transactions(
    db: Session = Depends(get_db),
    locality: Optional[str] = Query(None)
):
    query = db.query(PropertyTransaction)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    txs = query.limit(200).all()
    features = []
    for t in txs:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [t.longitude, t.latitude]
            },
            "properties": {
                "id": t.id,
                "locality_name": t.locality.name if t.locality else "",
                "property_type": t.property_type,
                "unit_type": t.unit_type,
                "carpet_area_sqft": t.carpet_area_sqft,
                "transacted_price": t.transacted_price,
                "price_per_sqft": t.price_per_sqft,
                "transaction_date": str(t.transaction_date),
                "data_source": t.data_source,
                "document_ref": t.document_ref
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/businesses")
def get_map_businesses(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    locality: Optional[str] = Query(None)
):
    query = db.query(Business)
    if category:
        query = query.filter(Business.category == category)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    businesses = query.limit(300).all()
    features = []
    for b in businesses:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [b.longitude, b.latitude]
            },
            "properties": {
                "id": b.id,
                "name": b.name,
                "category": b.category,
                "status": b.status,
                "verification_status": b.verification_status,
                "locality_name": b.locality.name if b.locality else ""
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/neighbourhoods")
def get_map_neighbourhoods(db: Session = Depends(get_db)):
    localities = db.query(Locality).all()
    features = []
    for loc in localities:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [loc.longitude, loc.latitude]
            },
            "properties": {
                "id": loc.id,
                "name": loc.name,
                "slug": loc.slug,
                "pincode": loc.pincode,
                "avg_asking_price_sqft": loc.avg_asking_price_sqft,
                "avg_transacted_price_sqft": loc.avg_transacted_price_sqft,
                "rental_yield_pct": loc.rental_yield_pct,
                "livability_score": loc.livability_score,
                "connectivity_score": loc.connectivity_score,
                "amenity_score": loc.amenity_score,
                "commercial_score": loc.commercial_score
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/heatmap")
def get_map_heatmap_points(db: Session = Depends(get_db)):
    txs = db.query(PropertyTransaction).all()
    points = []
    for t in txs:
        # Intensity scaled by price per sqft
        intensity = min(1.0, max(0.1, t.price_per_sqft / 15000.0))
        points.append({
            "lat": t.latitude,
            "lon": t.longitude,
            "weight": round(intensity, 2),
            "price_sqft": t.price_per_sqft
        })
    return points

