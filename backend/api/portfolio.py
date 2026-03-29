from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter()


@router.get("/")
async def get_portfolio():
    """Get portfolio overview"""
    holdings = [
        {"symbol": "RELIANCE", "name": "Reliance Industries", "qty": 50, "avg_price": 2600, "current_price": 2847.50, "sector": "Conglomerate"},
        {"symbol": "HDFCBANK", "name": "HDFC Bank", "qty": 100, "avg_price": 1580, "current_price": 1723.80, "sector": "Banking"},
        {"symbol": "TCS", "name": "TCS", "qty": 30, "avg_price": 3400, "current_price": 3654.20, "sector": "IT"},
        {"symbol": "INFY", "name": "Infosys", "qty": 60, "avg_price": 1420, "current_price": 1542.90, "sector": "IT"},
        {"symbol": "ITC", "name": "ITC Ltd", "qty": 200, "avg_price": 410, "current_price": 436.70, "sector": "FMCG"},
    ]

    total_invested = sum(h["avg_price"] * h["qty"] for h in holdings)
    total_value = sum(h["current_price"] * h["qty"] for h in holdings)
    total_return = total_value - total_invested

    return {
        "summary": {
            "total_value": round(total_value, 2),
            "total_invested": round(total_invested, 2),
            "total_return": round(total_return, 2),
            "return_percent": round(total_return / total_invested * 100, 2),
        },
        "holdings": [
            {
                **h,
                "current_value": round(h["current_price"] * h["qty"], 2),
                "pnl": round((h["current_price"] - h["avg_price"]) * h["qty"], 2),
                "return_percent": round((h["current_price"] - h["avg_price"]) / h["avg_price"] * 100, 2),
                "weight": round(h["current_price"] * h["qty"] / total_value * 100, 1),
            }
            for h in holdings
        ],
    }


@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """Get real-time stock quote"""
    try:
        from services.market_data import MarketDataService
        market = MarketDataService()
        quote = market.get_quote(symbol.upper())
        return quote
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news/{symbol}")
async def get_stock_news(symbol: str):
    """Get latest news for a stock"""
    try:
        from services.market_data import MarketDataService
        market = MarketDataService()
        news = market.get_news(symbol.upper())
        return {"symbol": symbol.upper(), "articles": news, "count": len(news)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
