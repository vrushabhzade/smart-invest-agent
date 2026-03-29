import sys
import os
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from contextlib import asynccontextmanager
    from dotenv import load_dotenv

    # Load .env
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

    from api import signals, patterns, chat, portfolio, market, reels
    from api.websocket import router as ws_router
    from database.models import init_db
except Exception as e:
    import traceback
    print(f"CRITICAL ERROR DURING IMPORT: {e}")
    traceback.print_exc()
    sys.exit(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup
    init_db()
    print("DB Database initialized")
    
    # --- Dashboard Hydration (Critical for Performance) ---
    # Ensures the dashboard has data the moment the app starts
    from api.market import fetch_and_cache_all
    try:
        await fetch_and_cache_all()
    except Exception as e:
        print(f"Error: Initial hydration failed: {e}")

    from services.scheduler import start_scheduler
    start_scheduler()
    
    print(f"Gemini API Key: {'configured' if os.getenv('GOOGLE_API_KEY') else 'MISSING'}")
    print(f"Notion Token: {'configured' if os.getenv('NOTION_TOKEN') else 'not set (optional)'}")
    yield
    print("Stopping... Shutting down...")


app = FastAPI(
    title="Smart Invest AI Platform",
    description="AI-powered investment intelligence for Indian markets",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend connections
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", ""),
    "https://smart-invest-ai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ─────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Smart Invest AI Platform",
        "version": "1.0.0",
        "gemini": "configured" if os.getenv("GOOGLE_API_KEY") else "missing",
        "notion": "configured" if os.getenv("NOTION_TOKEN") else "not set",
    }


# ─── Root Redirect ────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "Smart Invest AI Platform API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "signals": "/api/signals",
            "patterns": "/api/patterns",
            "chat": "/api/chat",
            "portfolio": "/api/portfolio",
        },
    }


# ─── Include Routers ──────────────────────────────
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(patterns.router, prefix="/api/patterns", tags=["patterns"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(reels.router, prefix="/api/reels", tags=["reels"])
app.include_router(ws_router, prefix="/ws", tags=["websocket"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
