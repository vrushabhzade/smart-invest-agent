from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.models import SessionLocal, Signal
from typing import List, Optional
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
async def get_signals(
    limit: int = 20,
    min_strength: int = 0,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all active signals, optionally filtered by strength or symbol"""
    query = db.query(Signal).filter(Signal.status == 'active')

    if min_strength > 0:
        query = query.filter(Signal.strength >= min_strength)
    if symbol:
        query = query.filter(Signal.symbol == symbol.upper())

    signals = query.order_by(Signal.created_at.desc()).limit(limit).all()

    return {
        "signals": [
            {
                "signal_id": s.id,
                "signal_type": s.signal_type,
                "symbol": s.symbol,
                "strength": s.strength,
                "reasoning": s.reasoning,
                "actionable_insight": s.actionable_insight,
                "risk_factors": s.risk_factors,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in signals
        ],
        "count": len(signals)
    }


@router.get("/{signal_id}")
async def get_signal(signal_id: str, db: Session = Depends(get_db)):
    """Get a specific signal by ID"""
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    return {
        "signal_id": signal.id,
        "signal_type": signal.signal_type,
        "symbol": signal.symbol,
        "strength": signal.strength,
        "reasoning": signal.reasoning,
        "actionable_insight": signal.actionable_insight,
        "risk_factors": signal.risk_factors,
        "sources": signal.sources,
        "created_at": signal.created_at.isoformat() if signal.created_at else None,
        "status": signal.status,
    }


@router.post("/scan")
async def trigger_scan():
    """Manually trigger an opportunity scan"""
    # In production this would invoke OpportunityRadarAgent
    return {
        "message": "Scan triggered",
        "status": "running",
        "estimated_time": "2-5 minutes"
    }
