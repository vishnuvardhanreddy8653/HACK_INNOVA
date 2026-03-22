import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import Voter

db = SessionLocal()

target_qr = "ZVB2600799"
voter = db.query(Voter).filter(Voter.qr_code == target_qr).first()
if voter:
    voter.aadhaar_id = "963436752652"
    db.commit()
    print("✅ Successfully updated Aadhaar ID to 963436752652")
else:
    print("❌ Voter not found. Run seed_db.py first.")

db.close()
