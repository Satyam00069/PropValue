import math
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import haversine_distance
from app.models.property import Property
from app.models.listing import Listing
from app.models.transaction import PropertyTransaction
from app.models.geo import Locality
from app.schemas.valuation import ComparableItem

class ComparablesService:
    @staticmethod
    def find_comparables(
        db: Session,
        locality_id: str,
        property_type: str,
        carpet_area_sqft: float,
        bedrooms: int,
        property_age_years: int = 3,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 5
    ) -> List[ComparableItem]:
        locality = db.query(Locality).filter(Locality.id == locality_id).first()
        if not locality:
            return []

        target_lat = lat if lat is not None else locality.latitude
        target_lon = lon if lon is not None else locality.longitude

        comparables = []

        # 1. Look for verified transactions first (Ground truth sales)
        transactions = db.query(PropertyTransaction).filter(
            PropertyTransaction.property_type == property_type
        ).all()

        for tx in transactions:
            dist_km = haversine_distance(target_lat, target_lon, tx.latitude, tx.longitude)
            # Area difference factor
            area_ratio = min(carpet_area_sqft, tx.carpet_area_sqft) / max(carpet_area_sqft, tx.carpet_area_sqft)
            # Distance penalty
            dist_factor = max(0.0, 1.0 - (dist_km / 10.0))
            # Calculate combined similarity score (0.0 to 1.0)
            similarity = round((area_ratio * 0.6) + (dist_factor * 0.4), 3)

            comparables.append(ComparableItem(
                title=f"{tx.unit_type or 'Apartment'} in {tx.locality.name if tx.locality else 'Pune'}",
                distance_meters=round(dist_km * 1000, 1),
                similarity_score=similarity,
                price=tx.transacted_price,
                price_per_sqft=tx.price_per_sqft,
                carpet_area_sqft=tx.carpet_area_sqft,
                bedrooms=float(bedrooms),
                record_type="verified_transaction",
                source=tx.data_source
            ))

        # 2. Look for active listings
        active_listings = db.query(Listing).join(Property).filter(
            Listing.status == "active",
            Property.property_type == property_type
        ).all()

        for l in active_listings:
            p = l.property
            dist_km = haversine_distance(target_lat, target_lon, p.latitude, p.longitude)
            area_ratio = min(carpet_area_sqft, p.carpet_area_sqft) / max(carpet_area_sqft, p.carpet_area_sqft)
            dist_factor = max(0.0, 1.0 - (dist_km / 10.0))
            similarity = round((area_ratio * 0.6) + (dist_factor * 0.4), 3)

            comparables.append(ComparableItem(
                title=p.title,
                distance_meters=round(dist_km * 1000, 1),
                similarity_score=similarity,
                price=l.asking_price,
                price_per_sqft=l.price_per_sqft,
                carpet_area_sqft=p.carpet_area_sqft,
                bedrooms=float(p.bedrooms),
                record_type="active_listing",
                source=l.source_name
            ))

        # Sort by similarity score descending
        comparables.sort(key=lambda x: x.similarity_score, reverse=True)
        return comparables[:limit]

