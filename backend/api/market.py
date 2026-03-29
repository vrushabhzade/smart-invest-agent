import yfinance as yf
from fastapi import APIRouter, HTTPException
from cachetools import TTLCache, cached
import pandas as pd
from typing import Dict, List, Any
import asyncio

router = APIRouter()

# ─── Global Marketing Cache for Instant Charts ────────────────────
# This cache will be hydrated by a background job every 60 seconds
MARKET_CACHE: Dict[str, Any] = {
    "nifty": None,
    "sensex": None
}

# Map human-readable symbols to Yahoo Finance symbols
SYMBOL_MAP = {
    "nifty": "^NSEI",
    "sensex": "^BSESN"
}

async def fetch_and_cache_all():
    """Hydrate the cache for all configured indices."""
    print("Hydrating market cache for Dashboard...")
    tasks = []
    for key in SYMBOL_MAP.keys():
        tasks.append(asyncio.to_thread(fetch_intraday_data_sync, key))
    
    results = await asyncio.gather(*tasks)
    
    for key, result in zip(SYMBOL_MAP.keys(), results):
        if result:
            # Process daily summary
            start_price = result[0]['price']
            current_price = result[-1]['price']
            change = current_price - start_price
            change_percent = (change / start_price) * 100
            
            MARKET_CACHE[key] = {
                "symbol": SYMBOL_MAP.get(key),
                "name": key.upper(),
                "current_price": current_price,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "data": result,
                "last_updated": pd.Timestamp.now().isoformat()
            }
    print("Market cache hydration complete.")

def fetch_intraday_data_sync(symbol_type: str, period: str = "1d", interval: str = "5m") -> List[Dict[str, Any]]:
    """Fetch structured intraday history from yfinance (Sync version)."""
    yf_symbol = SYMBOL_MAP.get(symbol_type.lower())
    if not yf_symbol:
        return []
    
    try:
        ticker = yf.Ticker(yf_symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            return []
            
        data = []
        for index, row in df.iterrows():
            dt_str = index.strftime("%I:%M %p")
            data.append({
                "time": dt_str,
                "timestamp": index.isoformat(),
                "price": round(row['Close'], 2),
                "volume": int(row['Volume'])
            })
            
        return data
    except Exception as e:
        print(f"Error fetching {symbol_type} data: {e}")
        return []

@router.get("/history/{symbol_type}")
async def get_market_history(symbol_type: str):
    """
    Get live chart data for the dashboard.
    Supported types: 'nifty', 'sensex'
    Returns from cache immediately.
    """
    cached_data = MARKET_CACHE.get(symbol_type.lower())
    
    # If cache is missing (e.g. at startup before first job), do a fallback fetch once
    if not cached_data:
        print(f"Warning: Cache miss for {symbol_type}, fetching on-demand...")
        # We'll do a one-off fetch for now, but background should have it.
        result = fetch_intraday_data_sync(symbol_type)
        if not result:
             raise HTTPException(status_code=503, detail="Market data currently unavailable")
        
        start_price = result[0]['price']
        current_price = result[-1]['price']
        change = current_price - start_price
        change_percent = (change / start_price) * 100
        
        return {
            "symbol": SYMBOL_MAP.get(symbol_type.lower()),
            "name": symbol_type.upper(),
            "current_price": current_price,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "data": result,
            "cache": "miss"
        }
        
    return {**cached_data, "cache": "hit"}
