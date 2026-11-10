from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.models.listing import Listing
from app.schemas.valuation import FairPriceAnalysisRequest, FairPriceAssessment, ValuationRequest
from app.services.valuation_service import ValuationService

router = APIRouter()

@router.post("/analyse", response_model=FairPriceAssessment)
def analyse_fair_price(request: FairPriceAnalysisRequest, db: Session = Depends(get_db)):
    """
    Evaluates whether an asking price is Undervalued, Fairly priced,
    Slightly overpriced, or Overpriced compared against AI baseline and comparable sales.
    """
    val_req = ValuationRequest(
        locality_id=request.locality_id,
        property_type=request.property_type,
        carpet_area_sqft=request.carpet_area_sqft,
        bedrooms=request.bedrooms,
        property_age_years=request.property_age_years,
        asking_price=request.asking_price
    )
    val_response = ValuationService.estimate_valuation(db, val_req)
    if not val_response.fair_price:
        raise HTTPException(status_code=400, detail="Could not evaluate fair price for the given input")

    return val_response.fair_price

