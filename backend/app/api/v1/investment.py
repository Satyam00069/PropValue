from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.models.listing import Listing
from app.models.geo import Locality
from app.schemas.investment import InvestmentAnalysisRequest, InvestmentAnalysisResponse
from app.services.investment_service import InvestmentService

router = APIRouter()

@router.post("/analyse", response_model=InvestmentAnalysisResponse)
def analyze_investment(req: InvestmentAnalysisRequest, db: Session = Depends(get_db)):
    return InvestmentService.analyze_investment(db, req)

@router.get("/opportunities")
def get_investment_opportunities(
    db: Session = Depends(get_db),
    max_budget: Optional[float] = Query(None),
    min_yield: Optional[float] = Query(None),
    locality: Optional[str] = Query(None)
):
    query = db.query(Property).join(Listing).filter(Listing.status == "active")

    if max_budget:
        query = query.filter(Listing.asking_price <= max_budget)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    properties = query.all()
    opportunities = []

    for p in properties:
        active_listing = next((l for l in p.listings if l.status == "active"), None)
        if not active_listing:
            continue

        base_rate = p.locality.avg_transacted_price_sqft if p.locality else 7500.0
        est_val = base_rate * p.carpet_area_sqft
        rental_yield = p.locality.rental_yield_pct if p.locality else 4.0

        if min_yield and rental_yield < min_yield:
            continue

        # Investment score calculation
        price_diff_pct = round(((active_listing.asking_price - est_val) / est_val) * 100.0, 1)
        discount_score = max(0.0, min(100.0, 50.0 - (price_diff_pct * 2.0)))
        yield_score = (rental_yield / 5.0) * 100.0
        overall_score = round((yield_score * 0.5) + (discount_score * 0.5), 1)

        primary_img = p.images[0].image_url if p.images else None

        opportunities.append({
            "property_id": p.id,
            "title": p.title,
            "locality_name": p.locality.name if p.locality else "",
            "property_type": p.property_type,
            "bedrooms": p.bedrooms,
            "carpet_area_sqft": p.carpet_area_sqft,
            "asking_price": active_listing.asking_price,
            "estimated_market_value": round(est_val, 2),
            "price_diff_pct": price_diff_pct,
            "fair_price_status": "Undervalued" if price_diff_pct < -5 else ("Fairly priced" if price_diff_pct <= 5 else "Overpriced"),
            "estimated_rental_yield_pct": rental_yield,
            "investment_score": overall_score,
            "primary_image": primary_img,
            "recommendation_reason": f"Features an estimated {rental_yield}% rental yield in {p.locality.name if p.locality else 'Pune'} with a strong rental tenant pool."
        })

    # Sort opportunities by highest investment score first
    opportunities.sort(key=lambda x: x["investment_score"], reverse=True)
    return opportunities

