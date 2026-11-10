from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings

class QualityVerificationService:
    MIN_PRICE_SQFT_PUNE = 2500.0
    MAX_PRICE_SQFT_PUNE = 45000.0
    MIN_CARPET_AREA_SQFT = 120.0
    MAX_CARPET_AREA_SQFT = 30000.0
    STALE_THRESHOLD_DAYS = 90

    @classmethod
    def validate_coordinates(cls, lat: Optional[float], lon: Optional[float]) -> Tuple[bool, str]:
        if lat is None or lon is None:
            return False, "Missing geographic coordinates"
        
        bounds = settings.PUNE_BOUNDS
        if not (bounds["min_lat"] <= lat <= bounds["max_lat"]):
            return False, f"Latitude {lat} falls outside Pune municipal boundary ({bounds['min_lat']} - {bounds['max_lat']})"
        if not (bounds["min_lon"] <= lon <= bounds["max_lon"]):
            return False, f"Longitude {lon} falls outside Pune municipal boundary ({bounds['min_lon']} - {bounds['max_lon']})"
        
        return True, "Valid Pune coordinates"

    @classmethod
    def validate_price(cls, price: Optional[float], carpet_area: Optional[float]) -> Tuple[bool, str]:
        if price is None or price <= 0:
            return False, "Invalid price amount"
        if carpet_area is None or carpet_area <= 0:
            return False, "Invalid carpet area specification"
        
        rate_sqft = price / carpet_area
        if rate_sqft < cls.MIN_PRICE_SQFT_PUNE:
            return False, f"Suspiciously low price per sq.ft. (₹{rate_sqft:.0f}/sqft). Pune minimum baseline is ₹{cls.MIN_PRICE_SQFT_PUNE:.0f}."
        if rate_sqft > cls.MAX_PRICE_SQFT_PUNE:
            return False, f"Suspiciously high price per sq.ft. (₹{rate_sqft:.0f}/sqft). Pune maximum threshold is ₹{cls.MAX_PRICE_SQFT_PUNE:.0f}."
        
        return True, "Price within market distribution"

    @classmethod
    def validate_dimensions(cls, carpet_area: Optional[float]) -> Tuple[bool, str]:
        if carpet_area is None or carpet_area < cls.MIN_CARPET_AREA_SQFT or carpet_area > cls.MAX_CARPET_AREA_SQFT:
            return False, f"Carpet area ({carpet_area} sqft) outside allowable limits ({cls.MIN_CARPET_AREA_SQFT} - {cls.MAX_CARPET_AREA_SQFT} sqft)"
        return True, "Valid dimensions"

    @classmethod
    def is_stale_listing(cls, last_verified: Optional[datetime]) -> bool:
        if not last_verified:
            return True
        now = datetime.now(timezone.utc)
        if last_verified.tzinfo is None:
            last_verified = last_verified.replace(tzinfo=timezone.utc)
        return (now - last_verified).days > cls.STALE_THRESHOLD_DAYS

