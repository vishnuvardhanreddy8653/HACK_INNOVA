from sqlalchemy.orm import Session
from app.db import models
import json

def trigger_fraud_alert(db: Session, voter_id: int, reason: str, image: str = None):
    alert = models.Alert(voter_id=voter_id, reason=reason, image=image)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Also log to audit
    audit = models.AuditLog(action="FRAUD_ALERT", user_role="SYSTEM", metadata_info=json.dumps({"reason": reason, "voter_id": voter_id}))
    db.add(audit)
    db.commit()
    
    return alert
