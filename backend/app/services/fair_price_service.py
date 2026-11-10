from typing import Optional, List
from app.schemas.valuation import FairPriceAssessment, ComparableItem

class FairPriceService:
    # Configurable valuation thresholds
    UNDERVALUED_THRESHOLD_PCT = -5.0
    FAIR_LOWER_THRESHOLD_PCT = -5.0
    FAIR_UPPER_THRESHOLD_PCT = 5.0
    SLIGHTLY_OVERPRICED_THRESHOLD_PCT = 15.0

    @classmethod
    def evaluate_fair_price(
        cls,
        asking_price: float,
        estimated_value: float,
        confidence_score: float,
        comparables: List[ComparableItem]
    ) -> FairPriceAssessment:
        if confidence_score < 0.40 or estimated_value <= 0:
            return FairPriceAssessment(
                asking_price=asking_price,
                estimated_value=estimated_value,
                difference_rupees=0.0,
                difference_percentage=0.0,
                status="Insufficient data",
                explanation="Model confidence or sample size in this micro-zone is insufficient to form an objective fair price assessment.",
                comparable_range_low=0.0,
                comparable_range_high=0.0
            )

        diff_rupees = asking_price - estimated_value
        diff_pct = round((diff_rupees / estimated_value) * 100.0, 2)

        # Calculate comparable range
        if comparables:
            comp_prices = [c.price for c in comparables]
            range_low = min(comp_prices)
            range_high = max(comp_prices)
        else:
            range_low = estimated_value * 0.90
            range_high = estimated_value * 1.10

        if diff_pct < cls.UNDERVALUED_THRESHOLD_PCT:
            status = "Undervalued"
            explanation = (
                f"The asking price is ₹{abs(diff_rupees):,.0f} ({abs(diff_pct):.1f}%) below the AI-estimated fair market value "
                f"of ₹{estimated_value:,.0f}. Based on recent verified transactions in this locality, this presents a favorable buying opportunity."
            )
        elif cls.FAIR_LOWER_THRESHOLD_PCT <= diff_pct <= cls.FAIR_UPPER_THRESHOLD_PCT:
            status = "Fairly priced"
            explanation = (
                f"The asking price is aligned within {abs(diff_pct):.1f}% of the AI fair market baseline (₹{estimated_value:,.0f}). "
                f"This reflects realistic seller expectations aligned with prevailing market activity."
            )
        elif cls.FAIR_UPPER_THRESHOLD_PCT < diff_pct <= cls.SLIGHTLY_OVERPRICED_THRESHOLD_PCT:
            status = "Slightly overpriced"
            explanation = (
                f"The asking price is ₹{diff_rupees:,.0f} ({diff_pct:.1f}%) above the estimated market value. "
                f"Negotiations could bridge this premium closer to comparable registered transaction levels."
            )
        else:
            status = "Overpriced"
            explanation = (
                f"The asking price carries a substantial {diff_pct:.1f}% markup (₹{diff_rupees:,.0f}) over fair market value. "
                f"It significantly exceeds recent registered transactions and similar local benchmarks."
            )

        return FairPriceAssessment(
            asking_price=round(asking_price, 2),
            estimated_value=round(estimated_value, 2),
            difference_rupees=round(diff_rupees, 2),
            difference_percentage=diff_pct,
            status=status,
            explanation=explanation,
            comparable_range_low=round(range_low, 2),
            comparable_range_high=round(range_high, 2)
        )

