from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.transaction import PropertyTransaction
from app.models.geo import Locality
from app.schemas.transaction import TransactionOut, TransactionStatsOut

router = APIRouter()

@router.get("", response_model=List[TransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    locality: Optional[str] = Query(None, description="Locality slug or ID"),
    property_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    query = db.query(PropertyTransaction)

    if property_type:
        query = query.filter(PropertyTransaction.property_type == property_type)
    if min_price:
        query = query.filter(PropertyTransaction.transacted_price >= min_price)
    if max_price:
        query = query.filter(PropertyTransaction.transacted_price <= max_price)
    if from_date:
        query = query.filter(PropertyTransaction.transaction_date >= from_date)
    if to_date:
        query = query.filter(PropertyTransaction.transaction_date <= to_date)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    txs = query.order_by(PropertyTransaction.transaction_date.desc()).offset(offset).limit(limit).all()
    results = []
    for t in txs:
        results.append(TransactionOut(
            id=t.id,
            locality_id=t.locality_id,
            locality_name=t.locality.name if t.locality else None,
            property_type=t.property_type,
            residential_commercial=t.residential_commercial,
            project_or_building_name=t.project_or_building_name,
            unit_type=t.unit_type,
            carpet_area_sqft=t.carpet_area_sqft,
            transacted_price=t.transacted_price,
            price_per_sqft=t.price_per_sqft,
            transaction_date=t.transaction_date,
            registration_office=t.registration_office,
            document_ref=t.document_ref,
            data_source=t.data_source,
            verification_status=t.verification_status,
            data_licence=t.data_licence,
            latitude=t.latitude,
            longitude=t.longitude
        ))
    return results

@router.get("/stats", response_model=TransactionStatsOut)
def get_transaction_stats(
    db: Session = Depends(get_db),
    locality: Optional[str] = Query(None)
):
    query = db.query(PropertyTransaction)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    total_count = query.count()
    if total_count == 0:
        return TransactionStatsOut(
            total_transactions=0,
            avg_price_sqft=0.0,
            min_price_sqft=0.0,
            max_price_sqft=0.0,
            median_price=0.0,
            last_updated_date=None
        )

    avg_sqft = query.with_entities(func.avg(PropertyTransaction.price_per_sqft)).scalar() or 0.0
    min_sqft = query.with_entities(func.min(PropertyTransaction.price_per_sqft)).scalar() or 0.0
    max_sqft = query.with_entities(func.max(PropertyTransaction.price_per_sqft)).scalar() or 0.0
    latest_date = query.with_entities(func.max(PropertyTransaction.transaction_date)).scalar()
    avg_price = query.with_entities(func.avg(PropertyTransaction.transacted_price)).scalar() or 0.0

    return TransactionStatsOut(
        total_transactions=total_count,
        avg_price_sqft=round(avg_sqft, 2),
        min_price_sqft=round(min_sqft, 2),
        max_price_sqft=round(max_sqft, 2),
        median_price=round(avg_price, 2),
        last_updated_date=latest_date
    )

@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction_detail(transaction_id: str, db: Session = Depends(get_db)):
    t = db.query(PropertyTransaction).filter(PropertyTransaction.id == transaction_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction record not found")
    return TransactionOut(
        id=t.id,
        locality_id=t.locality_id,
        locality_name=t.locality.name if t.locality else None,
        property_type=t.property_type,
        residential_commercial=t.residential_commercial,
        project_or_building_name=t.project_or_building_name,
        unit_type=t.unit_type,
        carpet_area_sqft=t.carpet_area_sqft,
        transacted_price=t.transacted_price,
        price_per_sqft=t.price_per_sqft,
        transaction_date=t.transaction_date,
        registration_office=t.registration_office,
        document_ref=t.document_ref,
        data_source=t.data_source,
        verification_status=t.verification_status,
        data_licence=t.data_licence,
        latitude=t.latitude,
        longitude=t.longitude
    )

