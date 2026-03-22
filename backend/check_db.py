import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import Voter

db = SessionLocal()

voter = db.query(Voter).filter(Voter.qr_code == "ZVB2600799").first()
if voter:
    print(f"Voter {voter.voter_id} has_voted: {voter.has_voted}")
else:
    print("Voter not found.")
db.close()
