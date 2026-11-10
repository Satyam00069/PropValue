export interface Locality {
  id: string;
  name: string;
  slug: string;
  pincode: string;
  latitude: number;
  longitude: number;
  connectivity_score: number;
  amenity_score: number;
  livability_score: number;
  commercial_score: number;
  avg_asking_price_sqft: number;
  avg_transacted_price_sqft: number;
  rental_yield_pct: number;
  quarterly_growth_pct: number;
  business_density_per_sqkm: number;
  description?: string;
  total_listings?: number;
  total_transactions?: number;
  infrastructure?: InfrastructureItem[];
}

export interface InfrastructureItem {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  source: string;
}

export interface Property {
  id: string;
  title: string;
  property_type: string;
  residential_commercial: string;
  address: string;
  locality_id: string;
  locality_name?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  carpet_area_sqft: number;
  builtup_area_sqft?: number;
  plot_area_sqft?: number;
  bedrooms: number;
  bathrooms: number;
  floor_number: number;
  total_floors: number;
  furnishing: string;
  parking_count: number;
  age_years: number;
  building_condition: string;
  road_width_ft: number;
  amenities?: string;
  asking_price?: number;
  price_per_sqft?: number;
  listing_id?: string;
  verification_status?: string;
  source_name?: string;
  last_verified_date?: string;
  primary_image?: string;
  estimated_value?: number;
  fair_price_status?: "Undervalued" | "Fairly priced" | "Slightly overpriced" | "Overpriced" | "Insufficient data";
  price_difference_pct?: number;
}

export interface PropertyDetail extends Property {
  description?: string;
  balconies?: number;
  facing?: string;
  images?: { id: string; image_url: string; caption?: string; is_primary: boolean }[];
  comparables?: ComparableItem[];
  nearby_amenities?: { name: string; category: string; status: string }[];
  nearby_businesses?: { name: string; category: string; status: string; verification: string }[];
  rental_yield_estimate?: number;
  investment_score?: number;
}

export interface PropertyTransaction {
  id: string;
  locality_id: string;
  locality_name?: string;
  property_type: string;
  residential_commercial: string;
  project_or_building_name?: string;
  unit_type?: string;
  carpet_area_sqft: number;
  transacted_price: number;
  price_per_sqft: number;
  transaction_date: string;
  registration_office?: string;
  document_ref?: string;
  data_source: string;
  verification_status: string;
  data_licence: string;
  latitude: number;
  longitude: number;
}

export interface ExplanationItem {
  feature_name: string;
  feature_value: string;
  shap_value: number;
  impact_direction: "positive" | "negative" | "neutral";
  explanation_text: string;
}

export interface ComparableItem {
  title: string;
  distance_meters: number;
  similarity_score: number;
  price: number;
  price_per_sqft: number;
  carpet_area_sqft: number;
  bedrooms: number;
  record_type: string;
  source: string;
}

export interface FairPriceAssessment {
  asking_price: number;
  estimated_value: number;
  difference_rupees: number;
  difference_percentage: number;
  status: "Undervalued" | "Fairly priced" | "Slightly overpriced" | "Overpriced" | "Insufficient data";
  explanation: string;
  comparable_range_low: number;
  comparable_range_high: number;
}

export interface ValuationResponse {
  valuation_id: string;
  locality_name: string;
  estimated_value: number;
  estimated_low: number;
  estimated_high: number;
  estimated_price_sqft: number;
  locality_benchmark_sqft: number;
  confidence_score: number;
  confidence_label: string;
  valuation_date: string;
  model_version: string;
  model_type: string;
  explanations: ExplanationItem[];
  comparables: ComparableItem[];
  fair_price?: FairPriceAssessment;
  data_freshness_note: string;
}

export interface ValuationRequest {
  locality_id: string;
  property_type: string;
  carpet_area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  floor_number: number;
  total_floors: number;
  property_age_years: number;
  furnishing: string;
  parking_count: number;
  building_condition: string;
  road_width_ft: number;
  amenities?: string;
  distance_to_metro_km?: number;
  asking_price?: number;
}

export interface Business {
  id: string;
  locality_id: string;
  locality_name?: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  verification_status: string;
  first_seen_date: string;
  last_verified_date: string;
  source: string;
}

export interface BusinessGrowthStats {
  locality_name: string;
  total_businesses: number;
  category_breakdown: Record<string, number>;
  operational_count: number;
  newly_mapped_count: number;
  verified_operational_count: number;
  growth_corridors: string[];
}

export interface EMICalculatorResponse {
  property_price: number;
  down_payment_amount: number;
  loan_amount: number;
  monthly_emi: number;
  total_interest_payable: number;
  total_repayment: number;
  stamp_duty_and_registration: number;
  total_estimated_purchase_cost: number;
  loan_to_value_ratio: number;
  amortization_schedule: {
    year: number;
    opening_balance: number;
    emi_paid: number;
    principal_paid: number;
    interest_paid: number;
    closing_balance: number;
  }[];
  disclaimer: string;
}

export interface InvestmentOpportunity {
  property_id: string;
  title: string;
  locality_name: string;
  property_type: string;
  bedrooms: number;
  carpet_area_sqft: number;
  asking_price: number;
  estimated_market_value: number;
  price_diff_pct: number;
  fair_price_status: string;
  estimated_rental_yield_pct: number;
  investment_score: number;
  primary_image?: string;
  recommendation_reason: string;
}

