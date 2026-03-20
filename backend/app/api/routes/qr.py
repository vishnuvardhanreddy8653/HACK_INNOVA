from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.biometric_service import verify_face_mock
from app.core.security import create_access_token
from datetime import timedelta
import uuid

router = APIRouter()

@router.post("/qr")
def verify_qr(request: schemas.QRVerifyRequest, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.qr_code == request.qr_code).first()
    if not voter:
        return {"status": "fail", "detail": "Invalid QR code"}
    
    # Generate session token for standard interactions
    token = create_access_token(data={"sub": voter.voter_id}, expires_delta=timedelta(minutes=15))
    return {"status": "success", "session_token": token, "voter_id": voter.voter_id}

@router.post("/face")
def verify_face(request: schemas.BiometricVerifyRequest, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.voter_id == request.voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
        
    is_valid = verify_face_mock(request.image_data, voter.face_embedding)
    if not is_valid:
        return {"status": "fail", "detail": "Biometric verification failed"}
    
    return {"status": "success", "detail": "Biometric verified"}
