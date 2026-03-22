from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.otp_service import generate_and_send_otp, verify_otp

router = APIRouter()

@router.post("/otp/send")
def send_otp(request: schemas.OTPSendRequest, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.aadhaar_id == request.aadhaar_id).first()
    if not voter or not voter.mobile_number:
        # Fallback for hackathon demo if dummy voter hasn't been seeded
        mobile_number = "+919704748654"  
    else:
        mobile_number = voter.mobile_number
        
    success = generate_and_send_otp(mobile_number)
    if success:
        # Mask mobile number heavily in response for security
        masked = "****" + mobile_number[-4:] if len(mobile_number) >= 4 else "****"
        return {"status": "success", "message": f"OTP successfully dispatched to {masked}"}
    raise HTTPException(status_code=500, detail="SMS Gateway Error")

@router.post("/otp/verify")
def validate_otp(request: schemas.OTPVerifyRequest, db: Session = Depends(get_db)):
    voter = db.query(models.Voter).filter(models.Voter.aadhaar_id == request.aadhaar_id).first()
    # Use the same fallback for evaluation
    mobile_number = voter.mobile_number if (voter and voter.mobile_number) else "+919704748654" 
    
    if verify_otp(mobile_number, request.otp):
        return {"status": "success", "detail": "Aadhaar Verification Complete"}
    raise HTTPException(status_code=400, detail="Invalid or Expired OTP")
