import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db.models import Voter

db = SessionLocal()

target_id = "ZVB2600799"
voter = db.query(Voter).filter(Voter.voter_id == target_id).first()

if voter:
    # We assign the physical path in the backend folder to the database record!
    voter.face_embedding = "my_face.jpg"
    db.commit()
    print("✅ Successfully updated voter's Face Image mapping string to point to `my_face.jpg`!")
else:
    print("❌ Voter not found. Did you delete the db?!")

db.close()
