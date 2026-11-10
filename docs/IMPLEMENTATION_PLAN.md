# PropValue AI — Implementation Plan & Verification Matrix

## Overview
This document tracks each phase of PropValue AI development, key technical components, and concrete verification criteria to ensure a solid, end-to-end functional SaaS platform.

| Phase | Core Objective | Key Deliverables | Verification Strategy |
|---|---|---|---|
| **Phase 1: Foundation** | Project setup, DB, Auth & Presentation framework | FastAPI app, SQLite/PostgreSQL layer, JWT auth, Next.js 15, Navigation bar, Homepage, Health endpoints | Automated pytest suite for auth, token generation, health endpoints; Next.js SSR build check |
| **Phase 2: Property Discovery** | Interactive map & listings marketplace | MapLibre GL JS integration, Pune listings & properties API, search/filters, Property detail view | Map marker rendering, locality boundary loading, search API tests |
| **Phase 3: Market Data & Registration Deeds** | Real transaction records and ingestion pipelines | Recently Sold API, OSM/RERA provider adapters, coordinate validator, duplicate detector | Transaction filtering tests, geocode boundary unit tests |
| **Phase 4: AI Valuation Engine & Fair Price** | Valuation estimation & explainability | Hedonic regression + ML pipeline, confidence interval, SHAP feature impact, Fair Price Detector | Unit tests with test property features, verification of fair price classification |
| **Phase 5: Neighbourhood & Business Intelligence** | Locality insights & commercial growth | Pune locality analytics (15 micro-markets), amenity density, business map with status flags | Locality score calculation tests, business category filter verification |
| **Phase 6: Investment & Financial Calculators** | Investment analytics & comparisons | Gross/net rental yield, EMI calculator with amortization schedule, 5-property comparison workspace | EMI math verification, comparison matrix test |
| **Phase 7: User Engagement & Reports** | Watchlist, alerts, and PDF generation | Saved properties, alert triggers, downloadable reproducible PDF valuation report | ReportLab PDF generation test, watchlist CRUD tests |
| **Phase 8: Production Hardening & Admin Dashboard** | Admin tooling, security, and packaging | Admin dashboard, audit logging, ingestion job monitor, Docker Compose configuration | End-to-end integration test, linting, Docker build verification |

