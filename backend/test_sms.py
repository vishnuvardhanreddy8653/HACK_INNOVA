import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

mobile_number = "+919676018610"

print("="*40)
print(f"DEBUG: Testing Twilio SMS Dispatch...")
print(f"SID Loaded: {TWILIO_SID[:5]}...{TWILIO_SID[-4:] if TWILIO_SID else 'MISSING'}")
print(f"FROM parameter: {TWILIO_PHONE_NUMBER}")
print(f"TO parameter: {mobile_number}")
print("="*40)

try:
    client = Client(TWILIO_SID, TWILIO_TOKEN)
    message = client.messages.create(
        body=f"Test SMS from Hackathon Voting App.",
        from_=TWILIO_PHONE_NUMBER,
        to=mobile_number
    )
    print(f"✅ Real SMS OTP sent via Twilio! SID: {message.sid}")
except Exception as e:
    print(f"❌ TWILIO ERROR: {e}")
