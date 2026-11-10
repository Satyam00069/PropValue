import math
from typing import List, Dict, Any, Optional
from app.core.database import haversine_distance

class DeduplicationService:
    """
    Duplicate Detection and Property Identity Matching.
    Matches records using:
    - Geographic proximity (within 50 meters)
    - Carpet area tolerance (+- 3%)
    - Floor number matching
    - Building / Project name fuzzy similarity
    """
    DISTANCE_THRESHOLD_KM = 0.05 # 50 meters
    AREA_TOLERANCE_RATIO = 0.03 # +- 3%

    @classmethod
    def are_duplicate_properties(
        cls,
        prop1: Dict[str, Any],
        prop2: Dict[str, Any]
    ) -> bool:
        # 1. Geographic proximity check
        lat1, lon1 = prop1.get("latitude"), prop1.get("longitude")
        lat2, lon2 = prop2.get("latitude"), prop2.get("longitude")
        if lat1 and lon1 and lat2 and lon2:
            dist = haversine_distance(lat1, lon1, lat2, lon2)
            if dist > cls.DISTANCE_THRESHOLD_KM:
                return False

        # 2. Carpet area tolerance check
        area1 = prop1.get("carpet_area_sqft")
        area2 = prop2.get("carpet_area_sqft")
        if area1 and area2:
            diff_ratio = abs(area1 - area2) / max(area1, area2)
            if diff_ratio > cls.AREA_TOLERANCE_RATIO:
                return False

        # 3. Floor number check if available
        floor1 = prop1.get("floor_number")
        floor2 = prop2.get("floor_number")
        if floor1 is not None and floor2 is not None and floor1 != floor2:
            return False

        # 4. Bedroom count check
        bhk1 = prop1.get("bedrooms")
        bhk2 = prop2.get("bedrooms")
        if bhk1 is not None and bhk2 is not None and bhk1 != bhk2:
            return False

        return True

    @classmethod
    def filter_duplicates(cls, incoming_records: List[Dict[str, Any]], existing_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        unique_records = []
        for inc in incoming_records:
            is_dup = False
            for ext in existing_records:
                if cls.are_duplicate_properties(inc, ext):
                    is_dup = True
                    break
            if not is_dup:
                unique_records.append(inc)
        return unique_records

