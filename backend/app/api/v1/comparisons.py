from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.models.listing import Listing
from app.models.user_features import ComparisonWorkspace
from app.schemas.user_features import ComparisonWorkspaceCreate, ComparisonWorkspaceOut
from app.schemas.property import PropertyOut
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/matrix")
def compare_properties_matrix(property_ids: List[str], db: Session = Depends(get_db)):
    if len(property_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 properties can be compared simultaneously")

    properties = db.query(Property).filter(Property.id.in_(property_ids)).all()
    results = []

    for p in properties:
        active_listing = next((l for l in p.listings if l.status == "active"), None)
        primary_img = p.images[0].image_url if p.images else None
        base_rate = p.locality.avg_transacted_price_sqft if p.locality else 7500.0
        est_val = base_rate * p.carpet_area_sqft
        asking = active_listing.asking_price if active_listing else 0.0
        diff_pct = round(((asking - est_val) / est_val) * 100.0, 1) if est_val > 0 else 0.0

        results.append({
            "id": p.id,
            "title": p.title,
            "locality_name": p.locality.name if p.locality else "",
            "property_type": p.property_type,
            "carpet_area_sqft": p.carpet_area_sqft,
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "floor_number": p.floor_number,
            "total_floors": p.total_floors,
            "furnishing": p.furnishing,
            "age_years": p.age_years,
            "parking_count": p.parking_count,
            "building_condition": p.building_condition,
            "asking_price": asking,
            "price_per_sqft": active_listing.price_per_sqft if active_listing else 0.0,
            "estimated_value": round(est_val, 2),
            "price_diff_pct": diff_pct,
            "fair_price_status": "Undervalued" if diff_pct < -5 else ("Fairly priced" if diff_pct <= 5 else "Overpriced"),
            "rental_yield_pct": p.locality.rental_yield_pct if p.locality else 3.8,
            "primary_image": primary_img,
            "amenities": p.amenities
        })

    return results

@router.post("", response_model=ComparisonWorkspaceOut)
def save_comparison_workspace(
    data: ComparisonWorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = ComparisonWorkspace(
        user_id=current_user.id,
        name=data.name,
        property_ids_csv=",".join(data.property_ids)
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return ComparisonWorkspaceOut(
        id=workspace.id,
        name=workspace.name,
        property_ids=data.property_ids,
        created_at=workspace.created_at
    )

