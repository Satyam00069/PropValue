from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.business import Business
from app.models.geo import Locality
from app.schemas.business import BusinessOut, BusinessGrowthStats

router = APIRouter()

@router.get("", response_model=List[BusinessOut])
def get_businesses(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    query = db.query(Business)

    if category:
        query = query.filter(Business.category == category)
    if verification_status:
        query = query.filter(Business.verification_status == verification_status)
    if search:
        query = query.filter(Business.name.ilike(f"%{search}%"))
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    businesses = query.limit(limit).all()
    results = []
    for b in businesses:
        results.append(BusinessOut(
            id=b.id,
            locality_id=b.locality_id,
            locality_name=b.locality.name if b.locality else None,
            name=b.name,
            category=b.category,
            latitude=b.latitude,
            longitude=b.longitude,
            status=b.status,
            verification_status=b.verification_status,
            first_seen_date=b.first_seen_date,
            last_verified_date=b.last_verified_date,
            source=b.source,
            notes=b.notes
        ))
    return results

@router.get("/growth", response_model=List[BusinessGrowthStats])
def get_business_growth(db: Session = Depends(get_db)):
    localities = db.query(Locality).all()
    stats_list = []

    for loc in localities:
        businesses = db.query(Business).filter(Business.locality_id == loc.id).all()
        cat_counts = {}
        operational = 0
        newly_mapped = 0
        verified_op = 0

        for b in businesses:
            cat_counts[b.category] = cat_counts.get(b.category, 0) + 1
            if b.status == "operational":
                operational += 1
            if b.verification_status == "newly_mapped":
                newly_mapped += 1
            elif b.verification_status == "confirmed_operational":
                verified_op += 1

        growth_corridors = []
        if loc.name in ["Hinjawadi", "Wakad"]:
            growth_corridors.append("Hinjawadi Phase 1 - Wakad Link Road")
        elif loc.name in ["Baner", "Balewadi"]:
            growth_corridors.append("Balewadi High Street Extension Corridor")
        elif loc.name in ["Kharadi", "Viman Nagar"]:
            growth_corridors.append("EON IT Park - Nagar Road Axis")

        stats_list.append(BusinessGrowthStats(
            locality_name=loc.name,
            total_businesses=len(businesses),
            category_breakdown=cat_counts,
            operational_count=operational,
            newly_mapped_count=newly_mapped,
            verified_operational_count=verified_op,
            growth_corridors=growth_corridors
        ))

    return stats_list

