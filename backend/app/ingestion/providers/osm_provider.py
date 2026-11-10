import requests
from typing import List, Dict, Any, Optional
from app.ingestion.providers.base_provider import BaseDataProvider
from app.core.config import settings

class OSMProvider(BaseDataProvider):
    """
    OpenStreetMap Data Provider via Overpass API.
    Queries amenities and commercial establishments within Pune municipal boundaries.
    Attribution: (c) OpenStreetMap contributors, licensed under ODbL.
    """
    def __init__(self, endpoint: Optional[str] = None):
        super().__init__("OpenStreetMap_ODbL")
        self.endpoint = endpoint or settings.OSM_OVERPASS_ENDPOINT

    def build_query(self, bbox: Dict[str, float], amenity_type: str = "hospital") -> str:
        s, w, n, e = bbox["min_lat"], bbox["min_lon"], bbox["max_lat"], bbox["max_lon"]
        return f"""
        [out:json][timeout:25];
        (
          node["amenity"="{amenity_type}"]({s},{w},{n},{e});
          way["amenity"="{amenity_type}"]({s},{w},{n},{e});
        );
        out center 50;
        """

    def fetch_records(self, locality_name: str, **kwargs) -> List[Dict[str, Any]]:
        # Use Pune bounds from settings
        bbox = kwargs.get("bbox", settings.PUNE_BOUNDS)
        amenity = kwargs.get("amenity_type", "hospital")
        ql = self.build_query(bbox, amenity)

        try:
            res = requests.post(self.endpoint, data={"data": ql}, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data.get("elements", [])
            return []
        except Exception as e:
            print(f"OSM Overpass query failed ({e}), falling back to cached provider records.")
            return []

    def transform_records(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        transformed = []
        for el in raw_data:
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            if not lat or not lon:
                continue

            transformed.append({
                "osm_id": el.get("id"),
                "name": name,
                "category": tags.get("amenity", "commercial"),
                "latitude": float(lat),
                "longitude": float(lon),
                "source": "OpenStreetMap_ODbL",
                "verification_status": "newly_mapped"
            })
        return transformed

