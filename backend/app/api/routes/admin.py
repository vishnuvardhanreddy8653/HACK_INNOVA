from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas

router = APIRouter()

@router.post("/link-qr")
def link_qr_to_voter(request: schemas.LinkQRRequest, db: Session = Depends(get_db)):
    """
    Admin endpoint: links a raw physical QR scan to a voter in the database.
    Call this once during setup to register the real voter card's QR value.
    """
    voter = db.query(models.Voter).filter(models.Voter.voter_id == request.voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail=f"Voter '{request.voter_id}' not found in database")
    
    old_qr = voter.qr_code
    voter.qr_code = request.scanned_qr
    db.commit()
    
    print(f"\n✅ QR LINKED: voter '{voter.voter_id}' qr_code updated")
    print(f"   Old: '{old_qr[:40]}...'")
    print(f"   New: '{request.scanned_qr[:40]}...'")
    
    return {
        "status": "success",
        "message": f"QR code successfully linked to voter '{voter.voter_id}'. You can now scan your physical card to log in."
    }
