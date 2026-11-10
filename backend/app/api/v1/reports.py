from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.valuation import ValuationRequest
from app.services.valuation_service import ValuationService
from app.services.report_generator import ReportGenerator

router = APIRouter()

@router.post("/valuation/pdf")
def download_valuation_report_pdf(req: ValuationRequest, db: Session = Depends(get_db)):
    """
    Generate and stream a professional, reproducible PDF valuation report
    complete with subject property specs, fair price analysis, SHAP breakdown,
    comparable properties, and legal disclaimers.
    """
    try:
        val_response = ValuationService.estimate_valuation(db, req)
        pdf_buffer = ReportGenerator.generate_valuation_pdf(val_response, req)
        
        pdf_bytes = pdf_buffer.getvalue()
        filename = f"PropValue_AI_Valuation_{val_response.locality_name}_{req.carpet_area_sqft}sqft.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\""
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate valuation PDF report: {str(e)}")

