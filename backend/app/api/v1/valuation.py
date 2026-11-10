from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.valuation import Valuation
from app.schemas.valuation import ValuationRequest, ValuationResponse, ComparableItem, ExplanationItem
from app.services.valuation_service import ValuationService

router = APIRouter()

@router.post("/estimate", response_model=ValuationResponse)
def estimate_property_value(request: ValuationRequest, db: Session = Depends(get_db)):
    """
    Generate AI Property Valuation with Conformal Prediction Intervals,
    SHAP-based Feature Attributions, and Nearest Verified Comparables.
    """
    try:
        return ValuationService.estimate_valuation(db, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Valuation computation error: {str(e)}")

@router.get("/{valuation_id}", response_model=dict)
def get_valuation(valuation_id: str, db: Session = Depends(get_db)):
    val = db.query(Valuation).filter(Valuation.id == valuation_id).first()
    if not val:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    return {
        "id": val.id,
        "locality_id": val.locality_id,
        "estimated_value": val.estimated_value,
        "estimated_low": val.estimated_low,
        "estimated_high": val.estimated_high,
        "estimated_price_sqft": val.estimated_price_sqft,
        "confidence_score": val.confidence_score,
        "model_version": val.model_version,
        "valuation_date": val.valuation_date,
        "explanations": [
            {
                "feature_name": exp.feature_name,
                "feature_value": exp.feature_value,
                "shap_value": exp.shap_value,
                "impact_direction": exp.impact_direction,
                "explanation_text": exp.explanation_text
            }
            for exp in val.explanations
        ],
        "comparables": [
            {
                "title": comp.title,
                "distance_meters": comp.distance_meters,
                "similarity_score": comp.similarity_score,
                "price": comp.price,
                "price_per_sqft": comp.price_per_sqft,
                "carpet_area_sqft": comp.carpet_area_sqft,
                "bedrooms": comp.bedrooms,
                "record_type": comp.record_type,
                "source": comp.source
            }
            for comp in val.comparables
        ]
    }

