from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.models.base import BaseModel

class DataIngestionJob(BaseModel):
    __tablename__ = "data_ingestion_jobs"

    source_name = Column(String(100), nullable=False) # "OSM_Pune_Amenities", "MahaRERA_Filings", "IGR_Registrations"
    status = Column(String(50), default="pending", nullable=False) # pending, running, completed, failed
    records_processed = Column(Integer, default=0, nullable=False)
    records_created = Column(Integer, default=0, nullable=False)
    records_skipped = Column(Integer, default=0, nullable=False)
    error_log = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    finished_at = Column(DateTime, nullable=True)

