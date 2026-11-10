# PropValue AI — AI Real Estate Valuation & Market Intelligence SaaS

**PropValue AI** is a production-ready AI-powered real estate valuation and market intelligence SaaS platform built for the Indian market, beginning with **Pune, Maharashtra**, and architected for seamless pan-India expansion.

The platform bridges real estate information asymmetry for homebuyers, sellers, institutional investors, brokers, and developers through transparent machine learning valuations, SHAP feature attributions, actual registered sale deed data, and neighbourhood intelligence.

---

## 1. Key Platform Capabilities

1. **AI Property Valuation Engine**: Supervised hedonic regression and LightGBM ensemble models predicting fair market value with calibrated conformal prediction intervals (10th to 90th percentile bounds).
2. **SHAP Feature Explainability**: Every valuation explains *why* the property is priced as it is with exact rupee impact values (carpet area baseline, floor elevation, age depreciation, transit proximity, furnishing, condition).
3. **Fair Price Detector**: Transparently categorizes properties as **Undervalued**, **Fairly priced**, **Slightly overpriced**, or **Overpriced** against registered deed benchmarks.
4. **Interactive Real Estate Map (MapLibre GL JS)**: Full-screen vector map centered on Pune with active listings, recently sold deeds, commercial business clusters, and locality boundaries.
5. **Recently Sold Module (Ground Truth Registrations)**: Strictly displays actual recorded transaction prices from Maharashtra IGR Sub-Registrar filings — never confuses asking prices with sold prices.
6. **Neighbourhood Intelligence**: Analytical livability profiles across **15 prioritized Pune micro-markets**:
   - *Hinjawadi, Wakad, Baner, Balewadi, Kharadi, Viman Nagar, Kothrud, Hadapsar, Magarpatta, Aundh, Pimple Saudagar, Bavdhan, Undri, Wagholi, Pimpri-Chinchwad*.
7. **Business Growth Map**: POI density tracking categorized commercial hubs, tech campuses (Infosys, Wipro, Barclays, EON Free Zone), and retail high streets with explicit distinction between *newly mapped* vs *verified operational* establishments.
8. **Investment Intelligence & Opportunity Finder**: Ranks properties by investment score, gross and net rental yield, holding period IRR, and appreciation scenarios.
9. **Financing & EMI Calculator**: Full mortgage calculator with Maharashtra stamp duty (7%), down payment, interest amortization schedule, and loan-to-value ratio.
10. **Property Comparison Workspace**: Multi-property workspace comparing up to 5 properties simultaneously across 12+ dimensions.
11. **Valuation PDF Report Generator**: Reproducible, professional downloadable valuation report complete with comparables, SHAP attributions, methodology, and legal disclaimers.
12. **Admin Dashboard**: Real-time system monitoring, external data ingestion pipelines (OSM, IGR, MahaRERA), and audit logs.

---

## 2. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, MapLibre GL JS, Lucide icons.
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0, Pydantic v2, ReportLab PDF Engine.
- **Database**: PostgreSQL 16 + PostGIS (with SQLite fallback for development and automated testing environments).
- **AI & ML**: NumPy, Pandas, Scikit-learn, LightGBM, Conformal quantile intervals, KNN spatial comparables matching.
- **Infrastructure**: Docker, Docker Compose, GitHub Actions.

---

## 3. Quickstart & Local Setup

### Prerequisites
- Python 3.12+
- Node.js 20+
- Git

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/propvalue-ai.git
cd propvalue-ai

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
# source venv/bin/activate    # On Linux/macOS

# Install backend dependencies
pip install -r backend/requirements.txt

# Run test suite (12 tests covering auth, valuation, fair price, PDF, API)
pytest backend/tests -v

# Start FastAPI development server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Interactive Swagger API docs: `http://localhost:8000/api/v1/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Run Next.js in development mode
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 4. Docker Compose Deployment

Run the complete stack with PostgreSQL PostGIS, Redis, Backend, and Frontend:
```bash
docker-compose up --build -d
```
Services:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL PostGIS: `localhost:5432`
- Redis: `localhost:6379`

---

## 5. Regulatory & Compliance Notice

- **DPDP Act (Digital Personal Data Protection)**: Personal identifying information (individual property owner names, contact numbers, PAN numbers) from government registry records is never scraped or exposed.
- **Data Provenance**: Advertised seller asking prices are strictly distinguished from registered sale deeds.
- **OpenStreetMap Attribution**: Geographic amenities and POIs are sourced from OpenStreetMap contributors under the Open Database License (ODbL).
- **Valuation Disclaimer**: AI estimates and fair price assessments are automated statistical calculations for decision-support and do not constitute registered valuations under the Indian Stamp Act, structural safety audits, or formal bank mortgage appraisals.

