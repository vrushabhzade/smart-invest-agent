"""
WebSocket endpoint for real-time market data streaming.
Pushes live stock prices and signal alerts to the frontend.
"""
import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Track active WebSocket connections
active_connections: List[WebSocket] = []
_broadcaster_task = None

# Demo market data (replace with real yfinance/NSE feeds in production)
STOCKS = {
    "RELIANCE": {"price": 2847.50, "base": 2847.50},
    "TCS": {"price": 3654.20, "base": 3654.20},
    "HDFCBANK": {"price": 1723.80, "base": 1723.80},
    "INFY": {"price": 1542.90, "base": 1542.90},
    "ICICIBANK": {"price": 1189.30, "base": 1189.30},
    "SBIN": {"price": 812.45, "base": 812.45},
    "BHARTIARTL": {"price": 1687.60, "base": 1687.60},
    "ITC": {"price": 436.70, "base": 436.70},
    "BAJFINANCE": {"price": 7230.00, "base": 7230.00},
    "TATASTEEL": {"price": 142.30, "base": 142.30},
}


def simulate_price_tick(stock: Dict) -> Dict:
    """Simulate a realistic price movement"""
    change_pct = random.gauss(0, 0.15)  # Normal distribution around 0
    stock["price"] = round(stock["price"] * (1 + change_pct / 100), 2)
    change = round(stock["price"] - stock["base"], 2)
    change_percent = round((stock["price"] - stock["base"]) / stock["base"] * 100, 2)
    return {
        "price": stock["price"],
        "change": change,
        "change_percent": change_percent,
    }


async def broadcast_market_data():
    """Push market data updates to all connected clients"""
    while True:
        if active_connections:
            tickers = []
            for symbol, data in STOCKS.items():
                tick = simulate_price_tick(data)
                tickers.append({
                    "symbol": symbol,
                    "price": tick["price"],
                    "change": tick["change"],
                    "change_percent": tick["change_percent"],
                    "timestamp": datetime.now().isoformat(),
                })

            message = json.dumps({
                "type": "market_update",
                "data": tickers,
                "timestamp": datetime.now().isoformat(),
            })

            # Send to all connected clients
            disconnected = []
            for ws in active_connections:
                try:
                    await ws.send_text(message)
                except Exception:
                    disconnected.append(ws)

            # Clean up disconnected clients
            for ws in disconnected:
                active_connections.remove(ws)

        await asyncio.sleep(2)  # Update every 2 seconds


@router.websocket("/market")
async def websocket_market(websocket: WebSocket):
    """WebSocket endpoint for live market data"""
    await websocket.accept()
    active_connections.append(websocket)
    print(f"📡 WebSocket connected. Active: {len(active_connections)}")

    try:
        global _broadcaster_task
        if _broadcaster_task is None:
            _broadcaster_task = asyncio.create_task(broadcast_market_data())

        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "subscribe":
                # Client wants to subscribe to specific symbols
                symbols = msg.get("symbols", [])
                await websocket.send_text(json.dumps({
                    "type": "subscribed",
                    "symbols": symbols,
                }))

            elif msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"📡 WebSocket disconnected. Active: {len(active_connections)}")
    except Exception as e:
        if websocket in active_connections:
            active_connections.remove(websocket)
        print(f"WebSocket error: {e}")
