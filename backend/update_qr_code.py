"""
Run this script AFTER scanning the QR code on the debug page to update
the voter's qr_code field in the database to match what the physical card actually encodes.

Usage:
  python update_qr_code.py "PASTE_THE_EXACT_QR_STRING_HERE"

Example:
  python update_qr_code.py "https://electoralsearch.eci.gov.in?vid=ZVB2600799"
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.db import models

if len(sys.argv) < 2:
    print("❌ Usage: python update_qr_code.py \"YOUR_SCANNED_QR_STRING\"")
    sys.exit(1)

new_qr = sys.argv[1].strip()
voter_id = "ZVB2600799"

db = SessionLocal()
voter = db.query(models.Voter).filter(models.Voter.voter_id == voter_id).first()

if not voter:
    print(f"❌ Voter {voter_id} not found. Run seed_db.py first.")
    db.close()
    sys.exit(1)

print(f"🔄 Old qr_code: '{voter.qr_code}'")
voter.qr_code = new_qr
db.commit()
print(f"✅ Updated qr_code to: '{new_qr}'")
print("The voter should now authenticate successfully.")
db.close()
