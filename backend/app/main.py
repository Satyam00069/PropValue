from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.services.db_init import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed Pune initial market data
    print("Initializing database and seeding Pune real estate dataset...")
    init_db()
    print("Database ready.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "market": "Pune, Maharashtra, India"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "description": "AI-Powered Real Estate Valuation & Market Intelligence SaaS",
        "documentation": f"{settings.API_V1_STR}/docs",
        "market_coverage": ["Hinjawadi", "Wakad", "Baner", "Balewadi", "Kharadi", "Viman Nagar", "Kothrud", "Magarpatta", "Aundh"]
    }

