from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class WatchlistItem(BaseModel):
    __tablename__ = "watchlist_items"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    target_price = Column(Float, nullable=True) # User's alert target price
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="watchlists")
    property = relationship("Property", back_populates="watchlist_items")

class PropertyAlert(BaseModel):
    __tablename__ = "property_alerts"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    locality_id = Column(String(36), ForeignKey("localities.id"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    alert_type = Column(String(50), nullable=False) # price_drop, undervalued_opportunity, new_listing, transaction_recorded
    criteria_json = Column(Text, nullable=False) # Stored filter dictionary: max_price, min_bedrooms, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    last_triggered_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="alerts")

class ComparisonWorkspace(BaseModel):
    __tablename__ = "comparison_workspaces"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), default="My Comparison", nullable=False)
    property_ids_csv = Column(Text, nullable=False) # Comma-separated property IDs (up to 5 properties)

    user = relationship("User", back_populates="comparisons")

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)

