from fastapi import APIRouter
from app.schemas.investment import EMICalculatorRequest, EMICalculatorResponse
from app.services.emi_service import EMIService

router = APIRouter()

@router.post("/emi", response_model=EMICalculatorResponse)
def calculate_emi(req: EMICalculatorRequest):
    return EMIService.calculate_emi(req)

