from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.geo import Locality
from app.models.property import Property
from app.models.listing import Listing
from app.schemas.investment import InvestmentAnalysisRequest, InvestmentAnalysisResponse
from app.schemas.valuation import ValuationRequest
from app.services.valuation_service import ValuationService

class InvestmentService:
    @staticmethod
    def analyze_investment(db: Session, req: InvestmentAnalysisRequest) -> InvestmentAnalysisResponse:
        locality = db.query(Locality).filter(Locality.id == req.locality_id).first()
        if not locality:
            locality = db.query(Locality).first()

        # Monthly rent calculation
        if req.monthly_rent_estimate and req.monthly_rent_estimate > 0:
            monthly_rent = req.monthly_rent_estimate
        else:
            # Estimate rent based on locality rental yield benchmark
            annual_benchmark_rent = req.purchase_price * (locality.rental_yield_pct / 100.0)
            monthly_rent = round(annual_benchmark_rent / 12.0, 2)

        gross_annual_rent = round(monthly_rent * 12.0, 2)
        gross_rental_yield = round((gross_annual_rent / req.purchase_price) * 100.0, 2)

        # Operational deductions: maintenance, property tax, vacancy allowance
        vacancy_deduction = gross_annual_rent * (req.vacancy_rate_pct / 100.0)
        net_annual_income = round(gross_annual_rent - req.annual_maintenance_inr - req.property_tax_inr - vacancy_deduction, 2)
        net_rental_yield = round(max(0.0, (net_annual_income / req.purchase_price) * 100.0), 2)

        # Capital Appreciation Simulation over holding period
        growth_rate = req.expected_annual_appreciation_pct / 100.0
        projected_exit_value = round(req.purchase_price * ((1.0 + growth_rate) ** req.holding_period_years), 2)
        
        total_net_rental_received = net_annual_income * req.holding_period_years
        total_capital_gain = projected_exit_value - req.purchase_price
        total_return_pct = round(((total_capital_gain + total_net_rental_received) / req.purchase_price) * 100.0, 2)
        annualized_irr = round((((projected_exit_value + total_net_rental_received) / req.purchase_price) ** (1.0 / req.holding_period_years) - 1.0) * 100.0, 2)

        # AI Valuation benchmark
        val_req = ValuationRequest(
            locality_id=locality.id,
            carpet_area_sqft=1000.0,
            asking_price=req.purchase_price
        )
        val_res = ValuationService.estimate_valuation(db, val_req)
        est_market_val = val_res.estimated_value

        # Calculate Investment Opportunity Score (0 to 100)
        # Yield score (40%), Valuation discount score (30%), Locality infrastructure score (30%)
        yield_score = min(100.0, (gross_rental_yield / 5.0) * 100.0)
        val_score = 50.0
        if est_market_val > 0:
            diff_ratio = (est_market_val - req.purchase_price) / est_market_val
            val_score = min(100.0, max(0.0, 50.0 + (diff_ratio * 200.0)))
        loc_score = ((locality.connectivity_score + locality.amenity_score + locality.commercial_score) / 30.0) * 100.0

        investment_score = round((yield_score * 0.40) + (val_score * 0.30) + (loc_score * 0.30), 1)

        # Recommendation tier
        if investment_score >= 80.0:
            tier = "High Potential"
        elif investment_score >= 65.0:
            tier = "Balanced Growth"
        elif investment_score >= 50.0:
            tier = "Moderate Yield"
        else:
            tier = "Capital Heavy"

        key_risks = [
            f"Rental yield sensitivity: {locality.name} yields fluctuate with corporate tenant leasing cycles.",
            "Execution of upcoming transit corridors may adjust locality pricing trajectories.",
            "Higher holding periods (> 5 years) are recommended to mitigate transaction fees and stamp duty friction."
        ]

        disclaimer = (
            "Investment projections represent analytical simulations with explicit economic assumptions. "
            "PropValue AI does not guarantee capital appreciation, rental yield, or loan eligibility."
        )

        return InvestmentAnalysisResponse(
            purchase_price=req.purchase_price,
            estimated_market_value=est_market_val,
            monthly_rent=monthly_rent,
            gross_annual_rent=gross_annual_rent,
            gross_rental_yield_pct=gross_rental_yield,
            net_annual_income=net_annual_income,
            net_rental_yield_pct=net_rental_yield,
            projected_exit_value=projected_exit_value,
            total_estimated_return_pct=total_return_pct,
            annualized_irr_pct=annualized_irr,
            investment_opportunity_score=investment_score,
            recommendation_tier=tier,
            key_risks=key_risks,
            disclaimer=disclaimer
        )

