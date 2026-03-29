from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.models import SessionLocal, DetectedPattern
from typing import Optional
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
async def get_patterns(
    limit: int = 20,
    min_confidence: float = 0,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get detected chart patterns"""
    query = db.query(DetectedPattern)

    if min_confidence > 0:
        query = query.filter(DetectedPattern.confidence >= min_confidence)
    if symbol:
        query = query.filter(DetectedPattern.symbol == symbol.upper())

    patterns = query.order_by(DetectedPattern.detected_at.desc()).limit(limit).all()

    return {
        "patterns": [
            {
                "id": p.id,
                "symbol": p.symbol,
                "pattern_type": p.pattern_type,
                "confidence": p.confidence,
                "detected_at": p.detected_at.isoformat() if p.detected_at else None,
                "price_at_detection": p.price_at_detection,
                "support_level": p.support_level,
                "resistance_level": p.resistance_level,
                "target_price": p.target_price,
                "stop_loss": p.stop_loss,
                "historical_success_rate": p.historical_success_rate,
                "explanation": p.explanation,
            }
            for p in patterns
        ],
        "count": len(patterns),
    }


@router.get("/scan/{symbol}")
async def scan_stock_pattern(symbol: str):
    """Scan a specific stock for chart patterns"""
    try:
        from services.market_data import MarketDataService
        market = MarketDataService()
        df = market.get_historical_data(symbol.upper())
        df = market.calculate_indicators(df)
        sr = market.detect_support_resistance(df)

        return {
            "symbol": symbol.upper(),
            "support_resistance": sr,
            "indicators": {
                "rsi": round(float(df['RSI'].iloc[-1]), 2) if 'RSI' in df.columns and not df['RSI'].isna().iloc[-1] else None,
                "macd": round(float(df['MACD'].iloc[-1]), 2) if 'MACD' in df.columns and not df['MACD'].isna().iloc[-1] else None,
                "sma_20": round(float(df['SMA_20'].iloc[-1]), 2) if 'SMA_20' in df.columns and not df['SMA_20'].isna().iloc[-1] else None,
                "sma_50": round(float(df['SMA_50'].iloc[-1]), 2) if 'SMA_50' in df.columns and not df['SMA_50'].isna().iloc[-1] else None,
            },
            "data_points": len(df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
