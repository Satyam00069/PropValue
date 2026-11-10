import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "PropValue AI" in data["service"]

def test_auth_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "user@propvalue.ai",
        "password": "User@12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "user@propvalue.ai"

def test_auth_login_invalid(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "user@propvalue.ai",
        "password": "WrongPassword999"
    })
    assert response.status_code == 401

def test_get_properties(client):
    response = client.get("/api/v1/properties")
    assert response.status_code == 200
    props = response.json()
    assert len(props) > 0
    first = props[0]
    assert "title" in first
    assert "asking_price" in first
    assert "carpet_area_sqft" in first
    assert "fair_price_status" in first

def test_get_property_detail(client):
    props = client.get("/api/v1/properties").json()
    assert len(props) > 0
    prop_id = props[0]["id"]

    response = client.get(f"/api/v1/properties/{prop_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == prop_id
    assert "comparables" in detail
    assert "nearby_amenities" in detail

def test_get_transactions(client):
    response = client.get("/api/v1/transactions")
    assert response.status_code == 200
    txs = response.json()
    assert len(txs) > 0
    assert "transacted_price" in txs[0]
    assert "registration_office" in txs[0]
    assert txs[0]["verification_status"] == "verified"

def test_ai_valuation_estimate(client):
    # Fetch first locality
    localities = client.get("/api/v1/neighbourhoods").json()
    assert len(localities) > 0
    loc_id = localities[0]["id"]

    val_payload = {
        "locality_id": loc_id,
        "property_type": "apartment",
        "carpet_area_sqft": 1050.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "floor_number": 5,
        "total_floors": 12,
        "property_age_years": 2,
        "furnishing": "semi_furnished",
        "parking_count": 1,
        "building_condition": "new",
        "road_width_ft": 40.0,
        "asking_price": 7500000.0
    }
    response = client.post("/api/v1/valuation/estimate", json=val_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_value"] > 0
    assert data["estimated_low"] < data["estimated_high"]
    assert len(data["explanations"]) > 0
    assert data["fair_price"] is not None
    assert data["fair_price"]["status"] in ["Undervalued", "Fairly priced", "Slightly overpriced", "Overpriced"]

def test_fair_price_detector(client):
    localities = client.get("/api/v1/neighbourhoods").json()
    loc_id = localities[0]["id"]

    fp_payload = {
        "locality_id": loc_id,
        "asking_price": 5000000.0,
        "carpet_area_sqft": 1000.0,
        "property_type": "apartment",
        "bedrooms": 2,
        "property_age_years": 3
    }
    response = client.post("/api/v1/fair-price/analyse", json=fp_payload)
    assert response.status_code == 200
    fp = response.json()
    assert "difference_percentage" in fp
    assert "status" in fp

def test_emi_calculator(client):
    payload = {
        "property_price": 8000000.0,
        "down_payment_pct": 20.0,
        "annual_interest_rate": 8.5,
        "loan_tenure_years": 20,
        "registration_stamp_duty_pct": 7.0
    }
    response = client.post("/api/v1/calculator/emi", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["monthly_emi"] > 0
    assert data["loan_amount"] == 6400000.0
    assert len(data["amortization_schedule"]) == 20

def test_neighbourhoods(client):
    response = client.get("/api/v1/neighbourhoods")
    assert response.status_code == 200
    locs = response.json()
    assert len(locs) >= 15 # All 15 Pune priority localities
    names = [l["name"] for l in locs]
    assert "Hinjawadi" in names
    assert "Wakad" in names
    assert "Baner" in names
    assert "Kharadi" in names
    assert "Kothrud" in names

def test_business_growth(client):
    response = client.get("/api/v1/businesses/growth")
    assert response.status_code == 200
    growth = response.json()
    assert len(growth) > 0
    assert "total_businesses" in growth[0]

def test_pdf_report_download(client):
    localities = client.get("/api/v1/neighbourhoods").json()
    loc_id = localities[0]["id"]

    payload = {
        "locality_id": loc_id,
        "property_type": "apartment",
        "carpet_area_sqft": 950.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "floor_number": 4,
        "total_floors": 10,
        "property_age_years": 3,
        "furnishing": "semi_furnished",
        "parking_count": 1,
        "building_condition": "good",
        "asking_price": 7200000.0
    }
    response = client.post("/api/v1/reports/valuation/pdf", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000 # Valid generated PDF binary

def test_data_quality_verification():
    from app.ingestion.verification import QualityVerificationService
    # Valid Pune coordinate
    is_valid, msg = QualityVerificationService.validate_coordinates(18.5204, 73.8567)
    assert is_valid is True

    # Out of bounds coordinate (e.g. Mumbai)
    is_valid_oob, _ = QualityVerificationService.validate_coordinates(19.0760, 72.8777)
    assert is_valid_oob is False

    # Suspicious price anomaly (e.g. ₹500/sqft in Pune)
    is_valid_price, _ = QualityVerificationService.validate_price(400000.0, 1000.0)
    assert is_valid_price is False

def test_deduplication():
    from app.ingestion.deduplication import DeduplicationService
    p1 = {"latitude": 18.591, "longitude": 73.738, "carpet_area_sqft": 800.0, "floor_number": 5, "bedrooms": 2}
    p2 = {"latitude": 18.591, "longitude": 73.738, "carpet_area_sqft": 805.0, "floor_number": 5, "bedrooms": 2}
    # Within 50 meters and 3% carpet area -> Duplicate
    assert DeduplicationService.are_duplicate_properties(p1, p2) is True

    # Different floor -> Not duplicate
    p3 = {"latitude": 18.591, "longitude": 73.738, "carpet_area_sqft": 800.0, "floor_number": 8, "bedrooms": 2}
    assert DeduplicationService.are_duplicate_properties(p1, p3) is False

def test_admin_ingestion_trigger(client):
    response = client.post("/api/v1/admin/ingestion/trigger?source=IGR_Pune_Deeds")
    assert response.status_code == 200
    data = response.json()
    assert "records_processed" in data
    assert data["records_processed"] > 0

