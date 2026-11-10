from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db, haversine_distance
from app.models.property import Property, PropertyImage
from app.models.listing import Listing
from app.models.geo import Locality, InfrastructureLocation
from app.models.business import Business
from app.schemas.property import PropertyOut, PropertyDetailOut, PropertyCreate, PropertyImageOut, ListingOut
from app.schemas.valuation import ValuationRequest
from app.services.valuation_service import ValuationService

router = APIRouter()

@router.get("", response_model=List[PropertyOut])
def get_properties(
    db: Session = Depends(get_db),
    locality: Optional[str] = Query(None, description="Locality slug or ID"),
    property_type: Optional[str] = Query(None),
    residential_commercial: Optional[str] = Query("residential"),
    bedrooms: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    fair_price_status: Optional[str] = Query(None), # e.g. "Undervalued", "Fairly priced"
    sort_by: Optional[str] = Query("newest"), # newest, price_asc, price_desc, fair_price
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    query = db.query(Property).join(Listing).filter(Listing.status == "active")

    if residential_commercial:
        query = query.filter(Property.residential_commercial == residential_commercial)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if bedrooms:
        query = query.filter(Property.bedrooms == bedrooms)
    if min_price:
        query = query.filter(Listing.asking_price >= min_price)
    if max_price:
        query = query.filter(Listing.asking_price <= max_price)
    if locality:
        query = query.join(Locality).filter(
            (Locality.id == locality) | (Locality.slug == locality.lower()) | (Locality.name.ilike(f"%{locality}%"))
        )

    properties = query.offset(offset).limit(limit).all()
    results = []

    for p in properties:
        active_listing = next((l for l in p.listings if l.status == "active"), None)
        if not active_listing:
            continue
        primary_img = next((img.image_url for img in p.images if img.is_primary), None)
        if not primary_img and p.images:
            primary_img = p.images[0].image_url

        # Fast heuristic fair price calculation
        base_rate = p.locality.avg_transacted_price_sqft if p.locality else 7500.0
        est_val = base_rate * p.carpet_area_sqft
        diff_pct = round(((active_listing.asking_price - est_val) / est_val) * 100.0, 1)

        if diff_pct < -5.0:
            status_text = "Undervalued"
        elif -5.0 <= diff_pct <= 5.0:
            status_text = "Fairly priced"
        elif 5.0 < diff_pct <= 15.0:
            status_text = "Slightly overpriced"
        else:
            status_text = "Overpriced"

        if fair_price_status and fair_price_status.lower() != status_text.lower():
            continue

        results.append(PropertyOut(
            id=p.id,
            title=p.title,
            property_type=p.property_type,
            residential_commercial=p.residential_commercial,
            address=p.address,
            locality_id=p.locality_id,
            locality_name=p.locality.name if p.locality else None,
            pincode=p.pincode,
            latitude=p.latitude,
            longitude=p.longitude,
            carpet_area_sqft=p.carpet_area_sqft,
            builtup_area_sqft=p.builtup_area_sqft,
            plot_area_sqft=p.plot_area_sqft,
            bedrooms=p.bedrooms,
            bathrooms=p.bathrooms,
            floor_number=p.floor_number,
            total_floors=p.total_floors,
            furnishing=p.furnishing,
            parking_count=p.parking_count,
            age_years=p.age_years,
            building_condition=p.building_condition,
            road_width_ft=p.road_width_ft,
            amenities=p.amenities,
            asking_price=active_listing.asking_price,
            price_per_sqft=active_listing.price_per_sqft,
            listing_id=active_listing.id,
            verification_status=active_listing.verification_status,
            source_name=active_listing.source_name,
            last_verified_date=active_listing.last_verified_date,
            primary_image=primary_img,
            estimated_value=round(est_val, 2),
            fair_price_status=status_text,
            price_difference_pct=diff_pct
        ))

    # Sort
    if sort_by == "price_asc":
        results.sort(key=lambda x: x.asking_price or 0)
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x.asking_price or 0, reverse=True)
    elif sort_by == "fair_price":
        # Undervalued first
        results.sort(key=lambda x: x.price_difference_pct or 0)

    return results

@router.get("/{property_id}", response_model=PropertyDetailOut)
def get_property_detail(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    active_listing = next((l for l in prop.listings if l.status == "active"), None)
    asking_price = active_listing.asking_price if active_listing else 0.0
    price_sqft = active_listing.price_per_sqft if active_listing else 0.0

    # Run AI Valuation Engine for Property
    val_req = ValuationRequest(
        locality_id=prop.locality_id,
        property_type=prop.property_type,
        carpet_area_sqft=prop.carpet_area_sqft,
        bedrooms=prop.bedrooms,
        bathrooms=prop.bathrooms,
        floor_number=prop.floor_number,
        total_floors=prop.total_floors,
        property_age_years=prop.age_years,
        furnishing=prop.furnishing,
        parking_count=prop.parking_count,
        building_condition=prop.building_condition,
        road_width_ft=prop.road_width_ft,
        amenities=prop.amenities,
        asking_price=asking_price
    )
    val_res = ValuationService.estimate_valuation(db, val_req)

    # Nearby Infrastructure Amenities
    nearby_infra = db.query(InfrastructureLocation).filter(
        InfrastructureLocation.locality_id == prop.locality_id
    ).limit(6).all()
    infra_list = [
        {"name": inf.name, "category": inf.category, "status": inf.status}
        for inf in nearby_infra
    ]

    # Nearby Businesses
    nearby_biz = db.query(Business).filter(
        Business.locality_id == prop.locality_id
    ).limit(8).all()
    biz_list = [
        {"name": b.name, "category": b.category, "status": b.status, "verification": b.verification_status}
        for b in nearby_biz
    ]

    # Rental Yield & Investment Score
    rental_yield = prop.locality.rental_yield_pct if prop.locality else 4.0
    investment_score = 78.5

    return PropertyDetailOut(
        id=prop.id,
        title=prop.title,
        description=prop.description,
        property_type=prop.property_type,
        residential_commercial=prop.residential_commercial,
        address=prop.address,
        locality_id=prop.locality_id,
        locality_name=prop.locality.name if prop.locality else None,
        pincode=prop.pincode,
        latitude=prop.latitude,
        longitude=prop.longitude,
        carpet_area_sqft=prop.carpet_area_sqft,
        builtup_area_sqft=prop.builtup_area_sqft,
        plot_area_sqft=prop.plot_area_sqft,
        bedrooms=prop.bedrooms,
        bathrooms=prop.bathrooms,
        balconies=prop.balconies,
        floor_number=prop.floor_number,
        total_floors=prop.total_floors,
        furnishing=prop.furnishing,
        parking_count=prop.parking_count,
        age_years=prop.age_years,
        building_condition=prop.building_condition,
        road_width_ft=prop.road_width_ft,
        facing=prop.facing,
        amenities=prop.amenities,
        asking_price=asking_price,
        price_per_sqft=price_sqft,
        listing_id=active_listing.id if active_listing else None,
        verification_status=active_listing.verification_status if active_listing else "unverified",
        source_name=active_listing.source_name if active_listing else "Direct",
        last_verified_date=active_listing.last_verified_date if active_listing else None,
        primary_image=prop.images[0].image_url if prop.images else None,
        images=[PropertyImageOut.model_validate(img) for img in prop.images],
        listings=[ListingOut.model_validate(l) for l in prop.listings],
        estimated_value=val_res.estimated_value,
        fair_price_status=val_res.fair_price.status if val_res.fair_price else "Fairly priced",
        price_difference_pct=val_res.fair_price.difference_percentage if val_res.fair_price else 0.0,
        comparables=[comp.model_dump() for comp in val_res.comparables],
        nearby_amenities=infra_list,
        nearby_businesses=biz_list,
        rental_yield_estimate=rental_yield,
        investment_score=investment_score
    )

@router.post("", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
def create_property(prop_in: PropertyCreate, db: Session = Depends(get_db)):
    locality = db.query(Locality).filter(Locality.id == prop_in.locality_id).first()
    if not locality:
        raise HTTPException(status_code=400, detail="Invalid locality specified")

    new_prop = Property(
        title=prop_in.title,
        description=prop_in.description,
        property_type=prop_in.property_type,
        residential_commercial=prop_in.residential_commercial,
        address=prop_in.address,
        locality_id=prop_in.locality_id,
        pincode=prop_in.pincode or locality.pincode,
        latitude=prop_in.latitude,
        longitude=prop_in.longitude,
        carpet_area_sqft=prop_in.carpet_area_sqft,
        builtup_area_sqft=prop_in.builtup_area_sqft or (prop_in.carpet_area_sqft * 1.25),
        bedrooms=prop_in.bedrooms,
        bathrooms=prop_in.bathrooms,
        floor_number=prop_in.floor_number,
        total_floors=prop_in.total_floors,
        furnishing=prop_in.furnishing,
        parking_count=prop_in.parking_count,
        age_years=prop_in.age_years,
        building_condition=prop_in.building_condition,
        road_width_ft=prop_in.road_width_ft,
        amenities=prop_in.amenities
    )
    db.add(new_prop)
    db.flush()

    price_sqft = round(prop_in.asking_price / prop_in.carpet_area_sqft, 2)
    listing = Listing(
        property_id=new_prop.id,
        asking_price=prop_in.asking_price,
        price_per_sqft=price_sqft,
        status="active",
        source_type=prop_in.source_type,
        source_name=prop_in.source_name,
        verification_status="user_submitted"
    )
    db.add(listing)
    db.commit()
    db.refresh(new_prop)

    return PropertyOut(
        id=new_prop.id,
        title=new_prop.title,
        property_type=new_prop.property_type,
        residential_commercial=new_prop.residential_commercial,
        address=new_prop.address,
        locality_id=new_prop.locality_id,
        locality_name=locality.name,
        pincode=new_prop.pincode,
        latitude=new_prop.latitude,
        longitude=new_prop.longitude,
        carpet_area_sqft=new_prop.carpet_area_sqft,
        builtup_area_sqft=new_prop.builtup_area_sqft,
        bedrooms=new_prop.bedrooms,
        bathrooms=new_prop.bathrooms,
        floor_number=new_prop.floor_number,
        total_floors=new_prop.total_floors,
        furnishing=new_prop.furnishing,
        parking_count=new_prop.parking_count,
        age_years=new_prop.age_years,
        building_condition=new_prop.building_condition,
        road_width_ft=new_prop.road_width_ft,
        amenities=new_prop.amenities,
        asking_price=listing.asking_price,
        price_per_sqft=listing.price_per_sqft,
        listing_id=listing.id,
        verification_status=listing.verification_status,
        source_name=listing.source_name,
        last_verified_date=listing.last_verified_date
    )

