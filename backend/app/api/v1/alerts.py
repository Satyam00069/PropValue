from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.user_features import PropertyAlert
from app.schemas.user_features import AlertCreate, AlertOut
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[AlertOut])
def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(PropertyAlert).filter(PropertyAlert.user_id == current_user.id).all()

@router.post("", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def create_property_alert(
    alert_in: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = PropertyAlert(
        user_id=current_user.id,
        title=alert_in.title,
        locality_id=alert_in.locality_id,
        alert_type=alert_in.alert_type,
        criteria_json=alert_in.criteria_json,
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return AlertOut.model_validate(alert)

@router.delete("/{alert_id}")
def delete_property_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(PropertyAlert).filter(
        PropertyAlert.id == alert_id,
        PropertyAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

