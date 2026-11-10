# PropValue AI — Database Schema Specification

## 1. Relational & Geospatial Design

The schema is built for PostgreSQL + PostGIS (with standard spatial compatibility layers for automated testing).

### Geographic Hierarchy
- **cities**: Canonical master of cities. Contains city boundary and centroid. Initial city: Pune.
- **localities**: Locality boundary polygons, centroid, postal code, average prices, liveability and infrastructure scores (Hinjawadi, Wakad, Baner, Balewadi, Kharadi, Viman Nagar, Kothrud, Hadapsar, Magarpatta, Aundh, Pimple Saudagar, Bavdhan, Undri, Wagholi, Pimpri-Chinchwad).
- **infrastructure_locations**: Point features for transport, schools, hospitals, IT parks with status (operational, under_construction, proposed).

### Property & Listings
- **properties**: Real estate units with structural specs: carpet area, built-up area, bedrooms, bathrooms, floor number, total floors, furnishing, age, building condition, road width, and geospatial Point coordinates.
- **listings**: Market listings tied to a property with asking price, price/sqft, source type (owner, broker, developer), listing date, verification status, and data source URL/identifier.
- **listing_price_history**: Price amendment tracking to capture price cuts and days on market.

### Real Registrations & Ground Truth Transactions
- **property_transactions**: Recorded sale deeds and registrations. Stores actual transaction price, transaction date, price/sqft, registration office / document reference, data source (e.g. Maharashtra IGR public notice, MahaRERA project disclosure), and verification status.

### Valuation & Model Governance
- **valuations**: Valuation records capturing estimated market value, high/low confidence bounds (quantile prediction), price/sqft, confidence score, and model version.
- **valuation_explanations**: Quantitative feature contributions (SHAP values) indicating positive or negative impact on property valuation.
- **comparable_properties**: Nearest similar properties identified via similarity scoring (proximity, size, bedrooms, age).

### Business Intelligence & POI
- **businesses**: Commercial establishments with geographic coordinates, category (restaurant, cafe, supermarket, hospital, school, IT company), status (operational, closed), and explicit provenance (newly mapped vs verified operational).
- **business_verification**: Verification audit log.

### User Workspaces & Engagement
- **users**: Accounts with hashed passwords, roles (`buyer`, `investor`, `seller`, `broker`, `analyst`, `admin`).
- **watchlists**: User-saved properties with custom target prices and notes.
- **property_alerts**: Alert configurations for price drops, undervalued listings, and newly recorded transactions in specific localities.
- **comparison_workspaces**: Multi-property workspaces comparing up to 5 properties across 15+ dimensions.
- **audit_logs**: Immutable admin action audit logs.
- **data_ingestion_jobs**: Ingestion job tracking with record counts, errors, and execution timings.

