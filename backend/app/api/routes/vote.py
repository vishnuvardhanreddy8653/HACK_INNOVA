from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.voting_service import cast_vote

router = APIRouter()

@router.post("/")
def submit_vote(vote: schemas.VoteCreate, voter_id: str, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.voter_id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voter not found")
        
    try:
        vote_record = cast_vote(db, voter, vote.candidate_id)
        return {"status": "success", "message": "Vote cast successfully", "vote_id": vote_record.id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/reset")
def reset_all_votes(db: Session = Depends(get_db)):
    # Admin route to reset all voting states to False for Phase 2 simulation
    try:
        db.query(models.Voter).update({models.Voter.has_voted: False})
        db.query(models.Vote).delete() # clear ballots
        db.commit()
    except Exception as e:
        print(f"Reset Error: {e}")
    return {"status": "success"}
