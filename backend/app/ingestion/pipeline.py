from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.ingestion import DataIngestionJob
from app.models.property import Property
from app.models.business import Business
from app.ingestion.verification import QualityVerificationService
from app.ingestion.deduplication import DeduplicationService

class IngestionPipeline:
    @classmethod
    def execute_ingestion(
        cls,
        db: Session,
        source_name: str,
        incoming_records: List[Dict[str, Any]],
        record_type: str = "property" # "property" or "business"
    ) -> DataIngestionJob:
        job = DataIngestionJob(
            source_name=source_name,
            status="running",
            records_processed=len(incoming_records),
            records_created=0,
            records_skipped=0,
            started_at=datetime.now(timezone.utc)
        )
        db.add(job)
        db.flush()

        error_logs = []
        created_count = 0
        skipped_count = 0

        # Load existing records for deduplication
        existing_props = []
        if record_type == "property":
            for p in db.query(Property).all():
                existing_props.append({
                    "id": p.id,
                    "latitude": p.latitude,
                    "longitude": p.longitude,
                    "carpet_area_sqft": p.carpet_area_sqft,
                    "floor_number": p.floor_number,
                    "bedrooms": p.bedrooms
                })

        for rec in incoming_records:
            lat = rec.get("latitude")
            lon = rec.get("longitude")

            # 1. Coordinate Bounds Validation
            valid_coords, coord_msg = QualityVerificationService.validate_coordinates(lat, lon)
            if not valid_coords:
                skipped_count += 1
                error_logs.append(f"Record '{rec.get('name') or rec.get('title')}': {coord_msg}")
                continue

            # 2. Property Specific Validations
            if record_type == "property":
                carpet = rec.get("carpet_area_sqft")
                price = rec.get("asking_price") or rec.get("price")

                valid_dim, dim_msg = QualityVerificationService.validate_dimensions(carpet)
                if not valid_dim:
                    skipped_count += 1
                    error_logs.append(f"Record '{rec.get('title')}': {dim_msg}")
                    continue

                valid_price, price_msg = QualityVerificationService.validate_price(price, carpet)
                if not valid_price:
                    skipped_count += 1
                    error_logs.append(f"Record '{rec.get('title')}': {price_msg}")
                    continue

                # Deduplication check
                is_dup = False
                for ep in existing_props:
                    if DeduplicationService.are_duplicate_properties(rec, ep):
                        is_dup = True
                        break
                if is_dup:
                    skipped_count += 1
                    error_logs.append(f"Duplicate property detected for '{rec.get('title')}'")
                    continue

            created_count += 1

        job.status = "completed"
        job.records_created = created_count
        job.records_skipped = skipped_count
        job.finished_at = datetime.now(timezone.utc)
        job.error_log = "\n".join(error_logs[:20]) # Keep first 20 errors

        db.commit()
        return job

