from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class Voter(Base):
    __tablename__ = 'voters'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    voter_id = Column(String, unique=True, index=True)
    qr_code = Column(String, unique=True, index=True)
    face_embedding = Column(String, nullable=True)
    iris_embedding = Column(String, nullable=True)
    fingerprint_hash = Column(String, nullable=True)
    has_voted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    votes = relationship("Vote", back_populates="voter")

class Vote(Base):
    __tablename__ = 'votes'
    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, ForeignKey('voters.id'))
    candidate_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

    voter = relationship("Voter", back_populates="votes")

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, nullable=True)
    image = Column(String, nullable=True)
    reason = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_role = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_info = Column(String) # using string for simple JSON storage in sqlite
