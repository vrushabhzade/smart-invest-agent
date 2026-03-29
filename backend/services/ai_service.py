import google.generativeai as genai
from typing import List, Dict
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

class AIAnalysisService:
    """
    Google Gemini API integration for intelligent analysis
    FREE tier: 15 RPM, 1 million tokens/day
    """

    def __init__(self):
        # gemini-1.5-flash: faster, cheaper, great for most tasks
        flash_model_name = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.flash_model = genai.GenerativeModel(flash_model_name)
        # gemini-1.5-pro: more capable, use for complex analysis
        pro_model_name = os.getenv('GEMINI_PRO_MODEL', 'gemini-1.5-pro')
        self.pro_model = genai.GenerativeModel(pro_model_name)

    def _call_gemini(self, prompt: str, use_pro: bool = False) -> str:
        """
        Core Gemini API call with error handling
        """
        model = self.pro_model if use_pro else self.flash_model
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return ""

    def analyze_filing(self, filing_text: str, company: str) -> Dict:
        """
        Deep analysis of corporate filing using Gemini
        """
        prompt = f"""
        You are a financial analyst AI. Analyze this corporate filing for {company}.

        Extract and analyze:
        1. Key Financial Metrics (revenue, profit, margins, guidance)
        2. Significant Changes from previous quarter/year
        3. Management Commentary Tone (optimistic, cautious, defensive)
        4. Hidden Insights (footnotes, risk factors, unusual language)
        5. Red Flags or Concerns
        6. Positive Catalysts

        Filing Text:
        {filing_text[:8000]}

        Return ONLY a JSON object (no markdown, no explanation) with this exact structure:
        {{
          "financial_metrics": {{
            "revenue": {{"value": 0, "change_yoy": 0, "change_qoq": 0}},
            "profit": {{"value": 0, "change_yoy": 0}},
            "margins": {{"gross": 0, "operating": 0, "net": 0}}
          }},
          "key_changes": ["change1", "change2"],
          "management_tone": "optimistic",
          "hidden_insights": ["insight1"],
          "red_flags": ["flag1"],
          "positive_catalysts": ["catalyst1"],
          "overall_sentiment": "bullish",
          "confidence_score": 75,
          "reasoning": "Brief explanation"
        }}
        """

        response_text = self._call_gemini(prompt, use_pro=True)

        try:
            # Clean up JSON if wrapped in markdown
            clean = response_text.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            return json.loads(clean.strip())
        except json.JSONDecodeError:
            return {"error": "Parse failed", "raw": response_text}

    def generate_signal_reasoning(
        self,
        signal_data: Dict,
        historical_patterns: List[Dict]
    ) -> str:
        """
        Generate human-readable reasoning for a signal
        """
        prompt = f"""
        You are an investment advisor AI. Generate a clear, actionable explanation for this trading signal.

        Signal Data:
        {json.dumps(signal_data, indent=2)}

        Historical Patterns (similar setups in the past):
        {json.dumps(historical_patterns, indent=2)}

        Provide:
        1. Why this signal matters (2-3 sentences)
        2. What typically happens in similar situations
        3. Specific action to consider
        4. Key risks to watch

        Write in clear, direct language. No jargon. Be specific with numbers.
        Limit to 150 words.
        """

        return self._call_gemini(prompt)

    def chat_query(
        self,
        user_message: str,
        portfolio: Dict,
        market_data: Dict,
        conversation_history: List[Dict]
    ) -> Dict:
        """
        Process chat query with full context using Gemini
        """
        # Build history for Gemini's multi-turn chat
        history = []
        for turn in conversation_history[-5:]:
            history.append({
                "role": "user" if turn['role'] == 'user' else "model",
                "parts": [turn['content']]
            })

        system_context = f"""
        You are an expert financial advisor AI for Indian markets.

        User's Portfolio:
        {json.dumps(portfolio, indent=2)}

        Current Market Data:
        {json.dumps(market_data, indent=2)}

        Guidelines:
        - Be specific and data-driven
        - Reference exact numbers from the data provided
        - Consider the user's portfolio when giving advice
        - Cite your sources with [SOURCE: ...] tags
        - Break down complex topics step-by-step
        - End with clear action items
        - Focus on NSE/BSE stocks and Indian market context
        """

        chat = self.flash_model.start_chat(history=history)
        full_message = f"{system_context}\n\nUser Question: {user_message}"
        response = chat.send_message(full_message)

        return {
            'text': response.text,
            'model': 'gemini-1.5-flash'
        }

    def explain_pattern(self, pattern: str, price_data: Dict) -> str:
        """
        Use Gemini to generate plain-English pattern explanation
        """
        prompt = f"""
        Explain this technical pattern to a beginner investor:

        Pattern: {pattern}
        Current Price: {price_data.get('close', 'N/A')}
        Support Level: {price_data.get('support', 'N/A')}
        Resistance Level: {price_data.get('resistance', 'N/A')}

        Provide:
        1. What this pattern means (2-3 sentences)
        2. What typically happens next
        3. Key price levels to watch
        4. Risk/reward setup

        Use simple language, avoid jargon. Keep it under 120 words.
        """
        return self._call_gemini(prompt)

    def analyze_news_sentiment(self, news_articles: List[str], symbol: str) -> Dict:
        """
        Analyze sentiment of news articles for a stock
        """
        articles_text = "\\n---\\n".join(news_articles[:5])  # Limit to 5 articles

        prompt = f"""
        Analyze the sentiment of these news articles about {symbol}:

        {articles_text}

        Return ONLY a JSON object:
        {{
          "overall_sentiment": "positive/negative/neutral",
          "sentiment_score": 0.75,
          "key_themes": ["theme1", "theme2"],
          "impact_assessment": "Brief impact summary"
        }}
        """

        response = self._call_gemini(prompt)
        try:
            clean = response.strip().strip("```json").strip("```")
            return json.loads(clean)
        except:
            return {"overall_sentiment": "neutral", "sentiment_score": 0.5}
    def generate_reel_content(self, market_data: Dict, reel_type: str) -> Dict:
        """
        Generate a 30-90s vertical video script for market updates
        """
        prompt = f"""
        You are a social media financial content creator. Generate a punchy, 30-60 second vertical video script (reel/short) based on this market data.

        Market Data:
        {json.dumps(market_data, indent=2)}

        Video Type: {reel_type}

        Return ONLY a JSON object (no markdown, no explanation) with this structure:
        {{
          "headline": "Snappy title for the overlay",
          "script": [
            {{"time": "0s", "text": "Hook: ...", "visual": "Description of overlay"}},
            {{"time": "15s", "text": "Body: ...", "visual": "Chart showing..."}},
            {{"time": "30s", "text": "CTA: ...", "visual": "End screen"}}
          ],
          "dynamic_data": {{
            "nifty_price": "...",
            "sense_change": "...",
            "top_gainer": "..."
          }}
        }}

        Keep it professional yet engaging for a retail audience.
        """

        response = self._call_gemini(prompt)
        try:
            # Clean up JSON if wrapped in markdown
            clean = response.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            return json.loads(clean.strip())
        except:
            return {
                "headline": f"Global Market Update: {reel_type}",
                "script": [
                    {"time": "0s", "text": "Markets are moving fast today.", "visual": "Market dashboard"},
                    {"time": "15s", "text": "Nifty shows significant volume.", "visual": "Volume bars"},
                    {"time": "30s", "text": "Follow for more updates.", "visual": "Smart Invest Logo"}
                ],
                "dynamic_data": {
                    "nifty_price": market_data.get('current_price', 'N/A'),
                    "change": market_data.get('change_percent', '0%')
                }
            }
