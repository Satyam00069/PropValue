from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.user_features import WatchlistItem
from app.models.property import Property
from app.schemas.user_features import WatchlistItemCreate, WatchlistItemOut
from app.schemas.property import PropertyOut
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[WatchlistItemOut])
def get_user_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).all()
    results = []
    for it in items:
        p = it.property
        active_listing = next((l for l in p.listings if l.status == "active"), None)
        base_rate = p.locality.avg_transacted_price_sqft if p.locality else 7500.0
        est_val = base_rate * p.carpet_area_sqft

        p_out = PropertyOut(
            id=p.id,
            title=p.title,
            property_type=p.property_type,
            residential_commercial=p.residential_commercial,
            address=p.address,
            locality_id=p.locality_id,
            locality_name=p.locality.name if p.locality else None,
            pincode=p.pincode,
            latitude=p.latitude,
            longitude=p.longitude,
            carpet_area_sqft=p.carpet_area_sqft,
            bedrooms=p.bedrooms,
            bathrooms=p.bathrooms,
            floor_number=p.floor_number,
            total_floors=p.total_floors,
            furnishing=p.furnishing,
            parking_count=p.parking_count,
            age_years=p.age_years,
            building_condition=p.building_condition,
            road_width_ft=p.road_width_ft,
            asking_price=active_listing.asking_price if active_listing else 0.0,
            price_per_sqft=active_listing.price_per_sqft if active_listing else 0.0,
            primary_image=p.images[0].image_url if p.images else None,
            estimated_value=round(est_val, 2)
        )

        results.append(WatchlistItemOut(
            id=it.id,
            user_id=it.user_id,
            property_id=it.property_id,
            target_price=it.target_price,
            notes=it.notes,
            created_at=it.created_at,
            property=p_out
        ))
    return results

@router.post("", response_model=WatchlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item_in: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.property_id == item_in.property_id
    ).first()
    if existing:
        return WatchlistItemOut.model_validate(existing)

    new_item = WatchlistItem(
        user_id=current_user.id,
        property_id=item_in.property_id,
        target_price=item_in.target_price,
        notes=item_in.notes
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return WatchlistItemOut.model_validate(new_item)

@router.delete("/{property_id}")
def remove_from_watchlist(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.property_id == property_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in watchlist")
    db.delete(item)
    db.commit()
    return {"message": "Property removed from watchlist successfully"}

