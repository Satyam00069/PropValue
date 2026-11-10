from typing import Optional, List
from pydantic import BaseModel, Field

class EMICalculatorRequest(BaseModel):
    property_price: float = Field(..., gt=100000)
    down_payment_pct: float = Field(20.0, ge=5.0, le=90.0)
    annual_interest_rate: float = Field(8.5, ge=1.0, le=25.0)
    loan_tenure_years: int = Field(20, ge=1, le=35)
    registration_stamp_duty_pct: float = Field(7.0, ge=0.0, le=15.0)

class AmortizationYear(BaseModel):
    year: int
    opening_balance: float
    emi_paid: float
    principal_paid: float
    interest_paid: float
    closing_balance: float

class EMICalculatorResponse(BaseModel):
    property_price: float
    down_payment_amount: float
    loan_amount: float
    monthly_emi: float
    total_interest_payable: float
    total_repayment: float
    stamp_duty_and_registration: float
    total_estimated_purchase_cost: float
    loan_to_value_ratio: float
    amortization_schedule: List[AmortizationYear]
    disclaimer: str

class InvestmentAnalysisRequest(BaseModel):
    property_id: Optional[str] = None
    locality_id: str
    purchase_price: float
    monthly_rent_estimate: Optional[float] = None
    holding_period_years: int = 5
    expected_annual_appreciation_pct: float = 6.0
    annual_maintenance_inr: float = 24000.0
    property_tax_inr: float = 12000.0
    vacancy_rate_pct: float = 5.0 # percentage of year vacant

class InvestmentAnalysisResponse(BaseModel):
    purchase_price: float
    estimated_market_value: float
    monthly_rent: float
    gross_annual_rent: float
    gross_rental_yield_pct: float
    net_annual_income: float
    net_rental_yield_pct: float
    projected_exit_value: float
    total_estimated_return_pct: float
    annualized_irr_pct: float
    investment_opportunity_score: float # 0 to 100
    recommendation_tier: str # "High Potential", "Balanced Growth", "Moderate Yield", "Capital Heavy"
    key_risks: List[str]
    disclaimer: str

