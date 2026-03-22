import os
import random
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
from dotenv import load_dotenv

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# In-memory store for OTPs (in production, use Redis)
OTP_STORE = {}

def generate_and_send_otp(mobile_number: str) -> bool:
    otp = str(random.randint(100000, 999999))
    OTP_STORE[mobile_number] = otp
    
    # If API keys are missing, we mock the sending for local testing by printing it to terminal
    if not TWILIO_AVAILABLE or not TWILIO_SID or not TWILIO_TOKEN:
        print(f"\n=========================================")
        print(f"MOCK SMS SENT TO: {mobile_number}")
        print(f"YOUR AADHAAR OTP IS: {otp}")
        print(f"=========================================\n")
        return True 
        
    try:
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        message = client.messages.create(
            body=f"Your Secure Voting Aadhaar OTP is: {otp}. Do not share this with anyone.",
            from_=TWILIO_PHONE_NUMBER,
            to=mobile_number
        )
        print(f"Real SMS OTP sent via Twilio! SID: {message.sid}")
        return True
    except Exception as e:
        print(f"Twilio API Error: {e}")
        print(f"\n=== MOCK FALLBACK DUE TO TWILIO ERROR ===")
        print(f"YOUR AADHAAR OTP TO {mobile_number} IS: {otp}")
        print(f"=========================================\n")
        return True

def verify_otp(mobile_number: str, entered_otp: str) -> bool:
    if mobile_number in OTP_STORE and OTP_STORE[mobile_number] == entered_otp:
        del OTP_STORE[mobile_number] # Consume OTP so it can't be reused
        return True
    return False

def send_alert_sms(mobile_number: str, message_text: str) -> bool:
    if not TWILIO_AVAILABLE or not TWILIO_SID or not TWILIO_TOKEN:
        print(f"\n=== MOCK ALERT SMS ===\nTO: {mobile_number}\nMSG: {message_text}\n======================\n")
        return True
    try:
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(body=message_text, from_=TWILIO_PHONE_NUMBER, to=mobile_number)
        print("✅ Alert SMS dispatched via Twilio.")
        return True
    except Exception as e:
        print(f"Twilio Alert Error: {e}")
        return False
