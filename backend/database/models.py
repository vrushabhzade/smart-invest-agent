# database/models.py
# ✅ Uses SQLite — no installation required

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./market_intelligence.db")

# Fix Supabase/Railway URL format (postgres:// → postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Signal(Base):
    __tablename__ = "signals"

    id = Column(String, primary_key=True)
    signal_type = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    strength = Column(Integer)
    reasoning = Column(JSON)
    actionable_insight = Column(Text)
    risk_factors = Column(JSON)
    sources = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
    status = Column(String, default='active')
    notion_page_id = Column(String, nullable=True)
    synced_to_notion = Column(Boolean, default=False)


class DetectedPattern(Base):
    __tablename__ = "detected_patterns"

    id = Column(String, primary_key=True)
    symbol = Column(String, nullable=False)
    pattern_type = Column(String, nullable=False)
    confidence = Column(Float)
    detected_at = Column(DateTime, default=datetime.now)
    price_at_detection = Column(Float)
    support_level = Column(Float)
    resistance_level = Column(Float)
    target_price = Column(Float)
    stop_loss = Column(Float)
    historical_success_rate = Column(Float)
    explanation = Column(Text)
    notion_page_id = Column(String, nullable=True)
    synced_to_notion = Column(Boolean, default=False)


class Filing(Base):
    __tablename__ = "filings"

    id = Column(String, primary_key=True)
    symbol = Column(String, nullable=False)
    filing_type = Column(String, nullable=False)
    title = Column(Text)
    content = Column(Text)
    filed_at = Column(DateTime, nullable=False)
    scraped_at = Column(DateTime, default=datetime.now)
    analyzed = Column(Boolean, default=False)
    analysis_result = Column(JSON)
    source_url = Column(Text)


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    conversation_id = Column(String, nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    citations = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)


def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")
