"""
Notion Integration Service
Syncs signals, patterns, and portfolio data to Notion databases.
Uses the Notion MCP server when available, or the Notion API directly.
"""
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any


class NotionService:
    """Manages syncing investment data to Notion databases."""

    def __init__(self):
        self.token = os.getenv("NOTION_API_KEY", "")
        self.signals_db = os.getenv("NOTION_DATABASE_SIGNALS", "")
        self.patterns_db = os.getenv("NOTION_DATABASE_PATTERNS", "")
        self.portfolio_db = os.getenv("NOTION_DATABASE_PORTFOLIO", "")
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
        }

    @property
    def is_configured(self) -> bool:
        return bool(self.token)

    async def sync_signal(self, signal: Dict[str, Any]) -> Optional[str]:
        """Create a Notion page for a new signal"""
        if not self.is_configured or not self.signals_db:
            return None

        try:
            import httpx

            page_data = {
                "parent": {"database_id": self.signals_db},
                "properties": {
                    "Name": {
                        "title": [{"text": {"content": f"{signal['symbol']} — {signal['signal_type']}"}}]
                    },
                    "Symbol": {"rich_text": [{"text": {"content": signal.get("symbol", "")}}]},
                    "Signal Type": {"select": {"name": signal.get("signal_type", "UNKNOWN")}},
                    "Strength": {"number": signal.get("strength", 0)},
                    "Status": {"select": {"name": "Active"}},
                    "Insight": {
                        "rich_text": [{"text": {"content": signal.get("actionable_insight", "")[:2000]}}]
                    },
                    "Date": {"date": {"start": datetime.now().isoformat()}},
                },
                "children": [
                    {
                        "object": "block",
                        "type": "heading_2",
                        "heading_2": {
                            "rich_text": [{"text": {"content": "AI Reasoning"}}]
                        },
                    }
                ] + [
                    {
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"text": {"content": r}}]
                        },
                    }
                    for r in (signal.get("reasoning") or ["No reasoning provided"])
                ] + [
                    {
                        "object": "block",
                        "type": "heading_2",
                        "heading_2": {
                            "rich_text": [{"text": {"content": "Risk Factors"}}]
                        },
                    }
                ] + [
                    {
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"text": {"content": r}}]
                        },
                    }
                    for r in (signal.get("risk_factors") or ["None identified"])
                ],
            }

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/pages",
                    json=page_data,
                    headers=self.headers,
                    timeout=15,
                )
                if resp.status_code == 200:
                    return resp.json().get("id")
                else:
                    print(f"Notion sync error: {resp.status_code} - {resp.text}")
                    return None

        except Exception as e:
            print(f"Notion sync failed: {e}")
            return None

    async def sync_pattern(self, pattern: Dict[str, Any]) -> Optional[str]:
        """Create a Notion page for a detected pattern"""
        if not self.is_configured or not self.patterns_db:
            return None

        try:
            import httpx

            page_data = {
                "parent": {"database_id": self.patterns_db},
                "properties": {
                    "Name": {
                        "title": [{"text": {"content": f"{pattern['symbol']} — {pattern['pattern_type']}"}}]
                    },
                    "Symbol": {"rich_text": [{"text": {"content": pattern.get("symbol", "")}}]},
                    "Pattern": {"select": {"name": pattern.get("pattern_type", "Unknown")}},
                    "Confidence": {"number": pattern.get("confidence", 0)},
                    "Target Price": {"number": pattern.get("target_price", 0)},
                    "Stop Loss": {"number": pattern.get("stop_loss", 0)},
                    "Date": {"date": {"start": datetime.now().isoformat()}},
                },
                "children": [
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"text": {"content": pattern.get("explanation", "")}}]
                        },
                    }
                ],
            }

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/pages",
                    json=page_data,
                    headers=self.headers,
                    timeout=15,
                )
                if resp.status_code == 200:
                    return resp.json().get("id")
                return None

        except Exception as e:
            print(f"Notion pattern sync failed: {e}")
            return None

    async def get_signals_from_notion(self, limit: int = 20) -> List[Dict]:
        """Query signals database from Notion"""
        if not self.is_configured or not self.signals_db:
            return []

        try:
            import httpx

            query = {
                "page_size": limit,
                "sorts": [{"property": "Date", "direction": "descending"}],
            }

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/databases/{self.signals_db}/query",
                    json=query,
                    headers=self.headers,
                    timeout=15,
                )
                if resp.status_code == 200:
                    results = resp.json().get("results", [])
                    return [self._parse_notion_signal(r) for r in results]
                return []

        except Exception as e:
            print(f"Notion query failed: {e}")
            return []

    def _parse_notion_signal(self, page: Dict) -> Dict:
        """Parse a Notion page into a signal dict"""
        props = page.get("properties", {})
        return {
            "notion_id": page.get("id"),
            "symbol": self._get_rich_text(props.get("Symbol", {})),
            "signal_type": self._get_select(props.get("Signal Type", {})),
            "strength": props.get("Strength", {}).get("number", 0),
            "status": self._get_select(props.get("Status", {})),
            "insight": self._get_rich_text(props.get("Insight", {})),
            "date": props.get("Date", {}).get("date", {}).get("start"),
        }

    @staticmethod
    def _get_rich_text(prop: Dict) -> str:
        texts = prop.get("rich_text", [])
        return texts[0].get("text", {}).get("content", "") if texts else ""

    @staticmethod
    def _get_select(prop: Dict) -> str:
        sel = prop.get("select")
        return sel.get("name", "") if sel else ""
