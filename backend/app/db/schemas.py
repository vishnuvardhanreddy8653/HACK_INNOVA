from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoterBase(BaseModel):
    name: str
    voter_id: str
    qr_code: str

class VoterCreate(VoterBase):
    pass

class Voter(VoterBase):
    id: int
    has_voted: bool
    created_at: datetime
    class Config:
        orm_mode = True

class VoteBase(BaseModel):
    candidate_id: int

class VoteCreate(VoteBase):
    pass

class QRVerifyRequest(BaseModel):
    qr_code: str

class BiometricVerifyRequest(BaseModel):
    voter_id: str
    image_data: str # simulated base64 image

class AlertCreate(BaseModel):
    voter_id: Optional[int] = None
    image: Optional[str] = None
    reason: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    voter_id: Optional[str] = None
