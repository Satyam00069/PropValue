from typing import List
from app.schemas.investment import EMICalculatorRequest, EMICalculatorResponse, AmortizationYear

class EMIService:
    @staticmethod
    def calculate_emi(req: EMICalculatorRequest) -> EMICalculatorResponse:
        down_payment_amount = round(req.property_price * (req.down_payment_pct / 100.0), 2)
        loan_amount = round(req.property_price - down_payment_amount, 2)
        
        # Monthly interest rate & total months
        monthly_rate = (req.annual_interest_rate / 12.0) / 100.0
        total_months = req.loan_tenure_years * 12
        
        # Standard EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
        if monthly_rate > 0:
            pow_val = (1.0 + monthly_rate) ** total_months
            monthly_emi = round((loan_amount * monthly_rate * pow_val) / (pow_val - 1.0), 2)
        else:
            monthly_emi = round(loan_amount / total_months, 2)

        total_repayment = round(monthly_emi * total_months, 2)
        total_interest_payable = round(total_repayment - loan_amount, 2)
        
        # Stamp duty & registration (typically ~7% in Maharashtra: 6% stamp duty + 1% registration/metro cess)
        stamp_duty = round(req.property_price * (req.registration_stamp_duty_pct / 100.0), 2)
        total_purchase_cost = round(req.property_price + stamp_duty, 2)
        ltv_ratio = round((loan_amount / req.property_price) * 100.0, 1)

        # Generate Amortization Schedule by Year
        amortization: List[AmortizationYear] = []
        current_balance = loan_amount

        for year in range(1, req.loan_tenure_years + 1):
            opening = current_balance
            year_interest = 0.0
            year_principal = 0.0

            for _ in range(12):
                if current_balance <= 0:
                    break
                interest_month = current_balance * monthly_rate
                principal_month = min(current_balance, monthly_emi - interest_month)
                year_interest += interest_month
                year_principal += principal_month
                current_balance -= principal_month

            closing = max(0.0, current_balance)
            amortization.append(AmortizationYear(
                year=year,
                opening_balance=round(opening, 2),
                emi_paid=round(monthly_emi * 12, 2),
                principal_paid=round(year_principal, 2),
                interest_paid=round(year_interest, 2),
                closing_balance=round(closing, 2)
            ))

        disclaimer = (
            "Actual interest rates, fees, loan eligibility, and lending terms depend on the financial institution. "
            "Stamp duty calculations are based on standard Maharashtra state fee schedules."
        )

        return EMICalculatorResponse(
            property_price=req.property_price,
            down_payment_amount=down_payment_amount,
            loan_amount=loan_amount,
            monthly_emi=monthly_emi,
            total_interest_payable=total_interest_payable,
            total_repayment=total_repayment,
            stamp_duty_and_registration=stamp_duty,
            total_estimated_purchase_cost=total_purchase_cost,
            loan_to_value_ratio=ltv_ratio,
            amortization_schedule=amortization,
            disclaimer=disclaimer
        )

