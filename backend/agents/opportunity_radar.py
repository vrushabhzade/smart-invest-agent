import asyncio
from datetime import datetime
from services.ai_service import AIAnalysisService
from services.market_data import MarketDataService

THRESHOLD = 60  # Minimum score to generate a signal

class OpportunityRadarAgent:
    """
    Multi-step reasoning agent using Gemini API
    """

    def __init__(self):
        self.ai = AIAnalysisService()
        self.market = MarketDataService()

    async def process_filing(self, filing_data: dict) -> dict | None:
        # Step 1: Extract key information using Gemini
        extracted = self.ai.analyze_filing(
            filing_data.get('content', ''),
            filing_data.get('company', 'Unknown')
        )

        # Step 2: Score the opportunity
        score = self._score_opportunity(extracted, filing_data)

        # Step 3: Generate signal if score high enough
        if score >= THRESHOLD:
            reasoning = self.ai.generate_signal_reasoning(
                {**filing_data, 'analysis': extracted, 'score': score},
                []  # Historical patterns (from DB)
            )

            return {
                'signal_id': f"SIG_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'timestamp': datetime.now().isoformat(),
                'stock': {
                    'symbol': filing_data.get('symbol', ''),
                    'name': filing_data.get('company', ''),
                    'current_price': filing_data.get('current_price', 0),
                    'sector': filing_data.get('sector', '')
                },
                'signal_type': self._classify_signal(extracted),
                'strength': min(score, 100),
                'reasoning': extracted.get('key_changes', []),
                'actionable_insight': reasoning,
                'risk_factors': extracted.get('red_flags', []),
                'sources': filing_data.get('sources', [])
            }

        return None

    def _score_opportunity(self, analysis: dict, filing_data: dict) -> int:
        score = 0

        # Factor 1: Sentiment
        sentiment = analysis.get('overall_sentiment', 'neutral')
        if sentiment == 'bullish':
            score += 30
        elif sentiment == 'bearish':
            score -= 10

        # Factor 2: Confidence
        score += analysis.get('confidence_score', 50) * 0.3

        # Factor 3: Positive catalysts
        score += len(analysis.get('positive_catalysts', [])) * 5

        # Factor 4: Red flags (negative)
        score -= len(analysis.get('red_flags', [])) * 8

        # Factor 5: Insider trading alignment
        if filing_data.get('insider_buying', False):
            score += 25

        return int(score)

    def _classify_signal(self, analysis: dict) -> str:
        tone = analysis.get('management_tone', 'neutral')
        sentiment = analysis.get('overall_sentiment', 'neutral')

        if sentiment == 'bullish' and tone == 'optimistic':
            return 'STRONG_BUY_SIGNAL'
        elif sentiment == 'bullish':
            return 'EARNINGS_SURPRISE'
        elif 'insider' in str(analysis).lower():
            return 'INSIDER_BUYING_CLUSTER'
        return 'OPPORTUNITY_DETECTED'
