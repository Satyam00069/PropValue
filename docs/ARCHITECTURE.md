# PropValue AI — Technical Architecture

## 1. System Vision
PropValue AI is a production-ready AI real estate valuation and market intelligence SaaS platform built for the Indian market, beginning with Pune, Maharashtra. It bridges the information asymmetry in Indian real estate by providing transparent property valuations, comparable sales analysis, fair price indicators, neighbourhood livability scoring, and investment yield projections.

## 2. Layered Architecture

```
                               ┌───────────────────────────┐
                               │   Next.js 15 Client App   │
                               │ - MapLibre GL JS Maps     │
                               │ - Recharts Analytics      │
                               │ - Responsive Tailwind UI  │
                               └─────────────┬─────────────┘
                                             │ HTTPS
                                             ▼
                               ┌───────────────────────────┐
                               │     FastAPI Gateway       │
                               │ - Authentication & RBAC   │
                               │ - Request Validation      │
                               │ - Rate Limiting & CORS    │
                               └─────────────┬─────────────┘
                                             │
             ┌───────────────────────────────┼──────────────────────────────┐
             ▼                               ▼                              ▼
┌─────────────────────────┐     ┌─────────────────────────┐    ┌─────────────────────────┐
│ Property & Valuation    │     │ Market & Geo Services   │    │ Ingestion & Integrity   │
│ - Hedonic Regression    │     │ - Locality Intelligence │    │ - Provider Adapters     │
│ - Machine Learning ML   │     │ - POI & Business Maps   │    │ - Duplicate Detection   │
│ - Conformal Intervals   │     │ - Spatial Filtering     │    │ - Provenance Auditing   │
│ - SHAP Explanations     │     │ - Investment Metrics    │    │ - Quality Verification  │
└────────────┬────────────┘     └────────────┬────────────┘    └────────────┬────────────┘
             │                               │                              │
             └───────────────────────────────┼──────────────────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │  PostgreSQL 16 + PostGIS  │
                               │  (SQLite Geo fallback)    │
                               │ - Spatial R-Tree Indexing │
                               │ - Temporal Audit Logs     │
                               └───────────────────────────┘
```

## 3. Technology Stack & Rationale
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui patterns, Recharts, MapLibre GL JS.
  - *Rationale*: Server-side rendering for search engine visibility, fast hydration, MapLibre GL JS for free, open-source, vector-tiled mapping without Google Maps API pricing traps.
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0, Pydantic v2.
  - *Rationale*: Native Python integration with scientific AI/ML libraries (LightGBM, Scikit-Learn, SHAP, NumPy, Pandas), asynchronous I/O, auto-generated OpenAPI 3.1 documentation.
- **Database**: PostgreSQL 16 + PostGIS for production with PostGIS spatial indexes (`ST_DWithin`, `ST_Contains`). Flexible abstraction layer supports SQLite for development and automated testing environments.
- **Valuation Machine Learning Engine**:
  - Baseline hedonic regression model + gradient-boosted trees.
  - Feature engineering: carpet area, age, floor ratio, parking, building condition, road width, distance to metro, distance to IT parks, locality baseline price per sqft.
  - Quantile intervals: Predicts 10th, 50th, and 90th percentiles to provide a credible confidence band instead of a single brittle number.
  - Tree explainability via SHAP / directional attribution so buyers understand *why* a property is priced as it is.

## 4. Security & Compliance
- Compliant with Indian Digital Personal Data Protection (DPDP) principles: personal owner identity information is never displayed or leaked; only registered deed summaries and aggregate data are shown.
- Password hashing with bcrypt, stateless JWT bearer tokens with expiration.
- Role-based authorization for administrative operations (ingestion pipelines, model updates, moderation).

