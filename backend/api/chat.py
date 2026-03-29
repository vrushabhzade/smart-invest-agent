from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter()

# In-memory conversation store (use DB in production)
conversations: dict = {}


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    text: str
    citations: List[dict] = []
    conversation_id: str
    timestamp: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message using Gemini AI"""
    conversation_id = request.conversation_id or str(uuid.uuid4())

    # Initialize or retrieve conversation
    if conversation_id not in conversations:
        conversations[conversation_id] = []

    try:
        from agents.market_chat import MarketChatAgent

        # Create agent with sample portfolio
        portfolio = {
            "holdings": [
                {"symbol": "RELIANCE", "qty": 50, "avg_price": 2600},
                {"symbol": "HDFCBANK", "qty": 100, "avg_price": 1580},
                {"symbol": "TCS", "qty": 30, "avg_price": 3400},
                {"symbol": "INFY", "qty": 60, "avg_price": 1420},
                {"symbol": "ITC", "qty": 200, "avg_price": 410},
            ],
            "total_invested": 2180000,
        }

        agent = MarketChatAgent(portfolio)
        agent.conversation_history = conversations[conversation_id]

        result = agent.process_query(request.message)

        # Store conversation
        conversations[conversation_id].append({"role": "user", "content": request.message})
        conversations[conversation_id].append({"role": "assistant", "content": result["text"]})

        return ChatResponse(
            text=result["text"],
            citations=result.get("citations", []),
            conversation_id=conversation_id,
            timestamp=result.get("timestamp", datetime.now().isoformat()),
        )

    except Exception as e:
        # Fallback response when Gemini is not available
        return ChatResponse(
            text=f"I encountered an issue connecting to the AI service: {str(e)}. Please check that your GOOGLE_API_KEY is configured in the .env file.",
            citations=[],
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat(),
        )
