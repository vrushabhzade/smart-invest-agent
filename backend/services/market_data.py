import yfinance as yf
import requests
import pandas as pd
import ta
from datetime import datetime
from typing import List, Dict
import os

class MarketDataService:
    """
    Free market data sources for Indian stocks
    """

    def get_quote(self, symbol: str) -> Dict:
        """
        Get real-time quote using yfinance (NSE suffix)
        Example: RELIANCE → RELIANCE.NS
        """
        try:
            ticker = yf.Ticker(f"{symbol}.NS")
            info = ticker.fast_info

            return {
                'symbol': symbol,
                'price': round(info.last_price, 2),
                'change': round(info.last_price - info.previous_close, 2),
                'change_percent': round(
                    (info.last_price - info.previous_close) / info.previous_close * 100, 2
                ),
                'volume': info.three_month_average_volume,
                'market_cap': info.market_cap,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Quote error for {symbol}: {e}")
            return {'symbol': symbol, 'error': str(e)}

    def get_historical_data(self, symbol: str, period: str = "6mo") -> pd.DataFrame:
        """
        Get OHLCV data using yfinance
        period options: 1mo, 3mo, 6mo, 1y, 2y, 5y
        """
        ticker = yf.Ticker(f"{symbol}.NS")
        df = ticker.history(period=period)
        df.index = df.index.tz_localize(None)
        return df

    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add technical indicators using ta library
        """
        # RSI
        df['RSI'] = ta.momentum.RSIIndicator(df['Close'], window=14).rsi()

        # MACD
        macd = ta.trend.MACD(df['Close'])
        df['MACD'] = macd.macd()
        df['Signal'] = macd.macd_signal()

        # Bollinger Bands
        bb = ta.volatility.BollingerBands(df['Close'], window=20, window_dev=2)
        df['BB_Upper'] = bb.bollinger_hband()
        df['BB_Lower'] = bb.bollinger_lband()
        df['BB_Mid'] = bb.bollinger_mavg()

        # Moving averages
        df['SMA_20'] = ta.trend.SMAIndicator(df['Close'], window=20).sma_indicator()
        df['SMA_50'] = ta.trend.SMAIndicator(df['Close'], window=50).sma_indicator()
        df['SMA_200'] = ta.trend.SMAIndicator(df['Close'], window=200).sma_indicator()

        # Volume SMA
        df['Volume_SMA'] = ta.trend.SMAIndicator(df['Volume'], window=20).sma_indicator()

        return df

    def detect_support_resistance(self, df: pd.DataFrame) -> Dict:
        """
        Simple support/resistance detection
        """
        recent = df.tail(50)
        support = float(recent['Low'].min())
        resistance = float(recent['High'].max())
        pivot = (support + resistance + float(recent['Close'].iloc[-1])) / 3

        return {
            'support': round(support, 2),
            'resistance': round(resistance, 2),
            'pivot': round(pivot, 2)
        }

    def get_nse_announcements(self) -> List[Dict]:
        """
        Scrape NSE corporate announcements (free, public)
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.nseindia.com'
        }

        session = requests.Session()
        session.get('https://www.nseindia.com', headers=headers)

        try:
            url = "https://www.nseindia.com/api/corporate-announcements?index=equities"
            response = session.get(url, headers=headers, timeout=10)
            data = response.json()
            return data if isinstance(data, list) else []
        except Exception as e:
            print(f"NSE announcement error: {e}")
            return []

    def get_news(self, symbol: str) -> List[Dict]:
        """
        Get news via NewsAPI free tier (100 req/day)
        """
        api_key = os.getenv('NEWS_API_KEY')
        if not api_key:
            return []

        url = "https://newsapi.org/v2/everything"
        params = {
            'q': f'{symbol} NSE OR BSE OR stock',
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 10,
            'apiKey': api_key
        }

        try:
            resp = requests.get(url, params=params, timeout=10)
            articles = resp.json().get('articles', [])
            return [
                {
                    'title': a['title'],
                    'description': a['description'],
                    'url': a['url'],
                    'published_at': a['publishedAt']
                }
                for a in articles
            ]
        except Exception as e:
            print(f"News error: {e}")
            return []

    def get_nse_universe(self) -> List[str]:
        """
        Return list of Nifty 500 stocks for scanning
        """
        # Top Nifty 100 for demo (avoids rate limiting)
        return [
            'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
            'HINDUNILVR', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK',
            'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'SUNPHARMA',
            'TITAN', 'ULTRACEMCO', 'BAJFINANCE', 'WIPRO', 'TECHM',
            'NESTLEIND', 'POWERGRID', 'NTPC', 'ONGC', 'HCLTECH',
            'BAJAJFINSV', 'ADANIPORTS', 'TATASTEEL', 'JSWSTEEL', 'GRASIM'
        ]
