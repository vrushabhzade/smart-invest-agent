from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.ai_service import AIAnalysisService
from api.market import MARKET_CACHE

router = APIRouter()
ai = AIAnalysisService()

class ReelRequest(BaseModel):
    reel_type: str  # e.g., "Daily Market Wrap", "Sector Rotation"

class ReelResponse(BaseModel):
    headline: str
    script: List[Dict[str, str]]
    dynamic_data: Dict[str, Any]

@router.post("/generate", response_model=ReelResponse)
async def generate_reel(request: ReelRequest):
    """
    Generate real-time AI content for the Video Engine
    """
    # Use Nifty from cache as representative data for the reel
    market_context = MARKET_CACHE.get("nifty")
    if not market_context:
        # Fallback if cache is really empty
        market_context = {
            "current_price": "22,450.30",
            "change_percent": "-1.2%",
            "top_gainer": "TCS (+2.3%)"
        }

    try:
        result = ai.generate_reel_content(market_context, request.reel_type)
        return ReelResponse(**result)
    except Exception as e:
        print(f"Reel generation error: {e}")
        # Return fallback content
        return ReelResponse(
            headline="Market Insights: " + request.reel_type,
            script=[
                {"time": "0s", "text": "Indices are showing volatility today.", "visual": "Market Chart"},
                {"time": "30s", "text": "Strategic levels to watch.", "visual": "Dashboard Preview"}
            ],
            dynamic_data=market_context
        )
