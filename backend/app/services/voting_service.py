from sqlalchemy.orm import Session
from app.db import models

def cast_vote(db: Session, voter: models.Voter, candidate_id: int):
    if voter.has_voted:
        # Trigger an alert or simply reject
        from app.services.alert_service import trigger_fraud_alert
        trigger_fraud_alert(db, voter.id, "Attempted duplicate voting", None)
        raise ValueError("User has already voted")

    vote = models.Vote(voter_id=voter.id, candidate_id=candidate_id)
    db.add(vote)
    
    voter.has_voted = True
    db.commit()
    db.refresh(vote)
    
    return vote
