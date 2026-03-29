from services.ai_service import AIAnalysisService
from datetime import datetime

class MarketChatAgent:
    """
    Portfolio-aware conversational AI using Gemini
    """

    def __init__(self, user_portfolio: dict):
        self.portfolio = user_portfolio
        self.ai = AIAnalysisService()
        self.conversation_history = []

    def process_query(self, user_message: str, market_data: dict = None) -> dict:
        """
        Process user query with portfolio context
        """
        response = self.ai.chat_query(
            user_message=user_message,
            portfolio=self.portfolio,
            market_data=market_data or {},
            conversation_history=self.conversation_history
        )

        # Store in history
        self.conversation_history.append({'role': 'user', 'content': user_message})
        self.conversation_history.append({'role': 'assistant', 'content': response['text']})

        # Parse citations
        cited = self._add_citations(response['text'])

        return {
            'text': cited['text'],
            'citations': cited['citations'],
            'timestamp': datetime.now().isoformat()
        }

    def _add_citations(self, response: str) -> dict:
        import re
        citations = []
        pattern = r'\[SOURCE: ([^\]]+)\]'

        def replace(match):
            cid = len(citations) + 1
            citations.append({'id': cid, 'source': match.group(1)})
            return f'<sup>[{cid}]</sup>'

        text = re.sub(pattern, replace, response)
        return {'text': text, 'citations': citations}
