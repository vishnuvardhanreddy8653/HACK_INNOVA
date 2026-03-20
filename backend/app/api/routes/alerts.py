from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import schemas
from app.services.alert_service import trigger_fraud_alert

router = APIRouter()

@router.post("/")
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    alert_record = trigger_fraud_alert(db, alert.voter_id, alert.reason, alert.image)
    return {"status": "success", "alert_id": alert_record.id}
