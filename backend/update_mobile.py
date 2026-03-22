import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import Voter

db = SessionLocal()

voter = db.query(Voter).filter(Voter.aadhaar_id == "963436752652").first()
if voter:
    voter.mobile_number = "+919676018610"
    db.commit()
    print("✅ Successfully updated mobile number to +919676018610")
else:
    print("❌ Voter not found. Run seed_db.py first.")

db.close()
