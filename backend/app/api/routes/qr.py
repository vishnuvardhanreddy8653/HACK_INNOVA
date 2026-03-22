from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.biometric_service import verify_face_mock, verify_face_real
from app.services.otp_service import send_alert_sms
from app.core.security import create_access_token
from datetime import timedelta
import uuid

router = APIRouter()

@router.post("/qr")
def verify_qr(request: schemas.QRVerifyRequest, db: Session = Depends(get_db)):
    # DEBUG: print what we actually received from the scanner
    print(f"\n🔍 QR SCAN RECEIVED: '{request.qr_code}'")
    print(f"🔍 QR length: {len(request.qr_code)}")
    
    # To handle realistic QR codes that might embed the ID in a longer URL/JSON string, 
    # we verify if ANY seeded database qr_code exists as a substring in the scanned string!
    voters = db.query(models.Voter).all()
    print(f"🔍 Voters in DB: {[(v.voter_id, v.qr_code) for v in voters]}")
    voter = next((v for v in voters if v.qr_code and v.qr_code in request.qr_code), None)
    
    if not voter:
        return {"status": "fail", "detail": f"Invalid or Unauthorized QR code. Scanned: '{request.qr_code}'"}
        
    if voter.has_voted:
        # SECURITY ALERT OVER SMS
        alert_msg = f"SECURITY ALERT: A login attempt was made using your Voter ID ({voter.voter_id}), but our records show you have already cast your vote."
        if voter.mobile_number:
            send_alert_sms(voter.mobile_number, alert_msg)
        return {"status": "fail", "detail": "You have already casted your vote. A security alert has been dispatched to your registered mobile number."}
    
    # Generate session token for standard interactions
    token = create_access_token(data={"sub": voter.voter_id}, expires_delta=timedelta(minutes=15))
    return {"status": "success", "session_token": token, "voter_id": voter.voter_id}

@router.post("/face")
def verify_face(request: schemas.BiometricVerifyRequest, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.voter_id == request.voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
        
    # We pass the real stored image physical path to DeepFace
    is_valid = verify_face_real(request.image_data, voter.face_embedding)
    if not is_valid:
        return {"status": "fail", "detail": "Biometric verification failed: Unauthorized Face"}
    
    return {"status": "success", "detail": "Biometric verified"}
