# PropValue AI — External Data Dependencies & Provenance Strategy

## 1. Principles
- **No Fabricated Records**: If verified transaction or listing data is unavailable for a specific pocket, the platform renders transparent notices ("No verified transactions registered for this micro-market in the last 12 months") instead of making up numbers.
- **Strict Distinction**: Asking prices (seller wishlist) are explicitly segregated from Registered Transaction prices (actual registered deed value).
- **Attribution & Licencing**: OpenStreetMap POI data is properly attributed in accordance with ODbL.
- **DPDP Act Compliance**: Personal identifiable information (owner names, contact numbers, PAN numbers) from government registry records is stripped and masked.

## 2. External Data Sources & Adapters

| Source Category | Provider / Interface | Protocol / Format | Licencing / Usage | Handling When Unavailable |
|---|---|---|---|---|
| Geographic & POI | OpenStreetMap / Overpass API | REST GeoJSON / Overpass QL | Open Database License (ODbL) | Fallback to cached city boundary and locality centroid dataset |
| Regulatory | MahaRERA Public Filings | REST API / Scraped disclosures | Maharashtra Real Estate Regulatory Authority public disclosures | Mark status as `User Submitted` or `Pending MahaRERA Verification` |
| Registration Deeds | Maharashtra IGR (Department of Registration & Stamps) | Document index summaries | Public records / RTI disclosures | Display aggregated locality benchmarks and declare registration records unavailable |
| Commercial Listings | Broker & Developer APIs / Direct submissions | JSON REST API / Web forms | Direct partnership / User submission | Flag with verification status (`verified`, `source_reported`, `user_submitted`, `stale`) |

## 3. Data Integrity & Deduplication Rules
1. **Coordinate Verification**: Geocode validation to ensure coordinates fall strictly within the municipal boundaries of Pune (Latitude: 18.35 to 18.75, Longitude: 73.65 to 74.05).
2. **Price Sanity Checks**: Detection of outlier prices (e.g. Pune residential price per sqft outside the ₹2,500 – ₹45,000 range flags manual review).
3. **Duplicate Property Matching**: Geohash (precision 8) + carpet area ± 3% + floor number + building name fuzzy matching (Levenshtein distance > 0.85).

