import os
import sys

# Add the backend root directory to sys.path so 'app' can be imported easily
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db.models import Voter

# Bind the engine to metadata to ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Your physical Voter ID card ID is "ZVB2600799"
target_qr = "ZVB2600799"

existing = db.query(Voter).filter(Voter.qr_code == target_qr).first()
if not existing:
    voter = Voter(
        name="Vishnu",
        voter_id="ZVB2600799",
        qr_code="ZVB2600799",
        aadhaar_id="963436752652",
        mobile_number="+919676018610",
        has_voted=False
    )
    db.add(voter)
    db.commit()
    print("==================================================")
    print("✅ Successfully seeded the ZVB2600799 Voter ID into Database!")
    print("==================================================")
else:
    print("==================================================")
    print("✅ Voter profile ZVB2600799 already exists in Database!")
    print("==================================================")

db.close()
