from fastapi import APIRouter
from app.api.v1 import (
    auth,
    properties,
    transactions,
    valuation,
    fair_price,
    map as map_router,
    neighbourhoods,
    businesses,
    investment,
    calculator,
    comparisons,
    watchlist,
    alerts,
    reports,
    admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(properties.router, prefix="/properties", tags=["Properties"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Recently Sold"])
api_router.include_router(valuation.router, prefix="/valuation", tags=["AI Valuation"])
api_router.include_router(fair_price.router, prefix="/fair-price", tags=["Fair Price Detector"])
api_router.include_router(map_router.router, prefix="/map", tags=["Interactive Map"])
api_router.include_router(neighbourhoods.router, prefix="/neighbourhoods", tags=["Neighbourhood Intelligence"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["Business Growth"])
api_router.include_router(investment.router, prefix="/investment", tags=["Investment Intelligence"])
api_router.include_router(calculator.router, prefix="/calculator", tags=["Calculators"])
api_router.include_router(comparisons.router, prefix="/comparisons", tags=["Property Comparison"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

