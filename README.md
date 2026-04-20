<div align="center">

# 🚀 Smart Invest Agent
### AI-Powered Investment Intelligence Platform for Indian Markets

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud)](https://smart-invest-frontend-382393355294.us-central1.run.app)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-Cloud_Run-34A853?style=for-the-badge&logo=google-cloud)](https://smart-invest-backend-382393355294.us-central1.run.app)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev)

> A next-generation multi-agent AI platform that delivers real-time market intelligence, chart pattern detection, portfolio analytics, and AI-powered chat — all tailored for NSE/BSE Indian stock markets.

![Smart Invest Agent Banner](https://img.shields.io/badge/NSE%20%7C%20BSE-Indian%20Markets-FF6600?style=flat-square)

</div>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SMART INVEST AGENT                               │
│                    Full-Stack AI Investment Platform                    │
└─────────────────────────────────────────────────────────────────────────┘

                              USER BROWSER
                                   │
                    ┌──────────────▼──────────────┐
                    │       NEXT.JS FRONTEND        │
                    │     (Cloud Run · Port 3000)   │
                    │                               │
                    │  ┌────────┐  ┌────────────┐  │
                    │  │Dashboard│  │  Signals   │  │
                    │  └────────┘  └────────────┘  │
                    │  ┌────────┐  ┌────────────┐  │
                    │  │Patterns│  │  Portfolio  │  │
                    │  └────────┘  └────────────┘  │
                    │  ┌────────┐  ┌────────────┐  │
                    │  │AI Chat │  │Video Engine│  │
                    │  └────────┘  └────────────┘  │
                    └──────────────┬──────────────┘
                                   │ REST + WebSocket
                    ┌──────────────▼──────────────┐
                    │      FASTAPI BACKEND          │
                    │     (Cloud Run · Port 8000)   │
                    │                               │
                    │  ┌──────────────────────────┐ │
                    │  │       API ROUTES           │ │
                    │  │  /api/market  /api/chat   │ │
                    │  │  /api/signals /api/patterns│ │
                    │  │  /api/portfolio /api/reels │ │
                    │  │  /ws (WebSocket)           │ │
                    │  └───────────┬──────────────┘ │
                    │              │                  │
                    │  ┌───────────▼──────────────┐ │
                    │  │      AGENT LAYER           │ │
                    │  │                            │ │
                    │  │ ┌──────────────────────┐  │ │
                    │  │ │  Opportunity Radar   │  │ │
                    │  │ │  • Scans Nifty 500   │  │ │
                    │  │ │  • Pattern Detection  │  │ │
                    │  │ │  • Signal Generation  │  │ │
                    │  │ └──────────────────────┘  │ │
                    │  │ ┌──────────────────────┐  │ │
                    │  │ │   Market Chat AI     │  │ │
                    │  │ │  • Gemini 1.5 Flash  │  │ │
                    │  │ │  • Context-Aware     │  │ │
                    │  │ │  • Market Q&A        │  │ │
                    │  │ └──────────────────────┘  │ │
                    │  └───────────┬──────────────┘ │
                    │              │                  │
                    │  ┌───────────▼──────────────┐ │
                    │  │     SERVICES LAYER         │ │
                    │  │                            │ │
                    │  │ ┌─────────┐ ┌──────────┐  │ │
                    │  │ │MarketData│ │AI Service│  │ │
                    │  │ │yfinance  │ │Gemini API│  │ │
                    │  │ │ta library│ │          │  │ │
                    │  │ └─────────┘ └──────────┘  │ │
                    │  │ ┌─────────┐ ┌──────────┐  │ │
                    │  │ │Scheduler│ │  Notion  │  │ │
                    │  │ │APSched  │ │  Sync    │  │ │
                    │  │ └─────────┘ └──────────┘  │ │
                    │  └───────────┬──────────────┘ │
                    └──────────────┼──────────────┘
                                   │
              ┌────────────────────┼───────────────────┐
              │                    │                    │
   ┌──────────▼──────┐  ┌─────────▼───────┐  ┌───────▼────────┐
   │   SQLite / PG    │  │   yfinance API  │  │  Google Gemini │
   │   (Database)     │  │   NSE/BSE Data  │  │  AI (Free Tier)│
   └─────────────────┘  └─────────────────┘  └────────────────┘
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                         │
└─────────────────────────────────────────────────────────────────┘

  NSE / BSE Market              User Request              Scheduler
       │                             │                      (APScheduler)
       ▼                             ▼                           │
  ┌─────────┐              ┌──────────────────┐                  │
  │yfinance │              │   FastAPI Router  │◄─────────────────┘
  │  API    │              │   /api/...        │
  └────┬────┘              └────────┬─────────┘
       │                            │
       ▼                            ▼
  ┌──────────────────────────────────────────┐
  │            OPPORTUNITY RADAR AGENT        │
  │                                          │
  │  1. Fetch OHLCV Data (yfinance)          │
  │  2. Calculate Indicators (ta library)    │
  │     • RSI, MACD, Bollinger Bands         │
  │     • SMA 20/50/200, Volume Analysis     │
  │  3. Detect Patterns & Signals            │
  │  4. Score & Rank Opportunities           │
  │  5. Generate AI Explanation (Gemini)     │
  └───────────────────┬──────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
  ┌───────────────┐     ┌──────────────────┐
  │   SQLite DB   │     │  Notion Database  │
  │  (Signals,    │     │  (Sync Reports,  │
  │   Patterns,   │     │   Watchlists,    │
  │   Portfolio)  │     │   Research Notes) │
  └───────┬───────┘     └──────────────────┘
          │
          ▼
  ┌───────────────────────────────────────┐
  │          MARKET CHAT AI AGENT          │
  │                                       │
  │  Input: User Question + Market Context│
  │  Model: Gemini 1.5 Flash / Pro        │
  │  Output: Intelligent Market Analysis  │
  └───────────────────┬───────────────────┘
                      │
                      ▼
  ┌───────────────────────────────────────┐
  │         NEXT.JS FRONTEND              │
  │  Dashboard → Signals → Patterns →    │
  │  Portfolio → AI Chat → Video Engine  │
  └───────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description | Tech |
|---------|-------------|------|
| 📊 **Live Dashboard** | Real-time NSE/BSE market overview with top movers | yfinance + WebSocket |
| 🎯 **AI Signals** | Buy/Sell signals with confidence scores & explanations | Gemini 1.5 + RSI/MACD |
| 📈 **Chart Patterns** | 15+ pattern types: H&S, Double Bottom, Bull Flag, etc. | ta library + AI |
| 💼 **Portfolio Tracker** | Track holdings, P&L, risk metrics in real-time | SQLite + pandas |
| 🤖 **Market Chat AI** | Ask anything about markets — powered by Gemini AI | Gemini 1.5 Flash |
| 🎬 **Video Engine** | Auto-generate market analysis video scripts & reels | Gemini Pro |
| 📓 **Notion Sync** | Sync signals, watchlists & research to Notion databases | notion-client |
| ⏰ **Auto Scheduler** | Background scanning of Nifty 500 every market hour | APScheduler |

---

## 🧠 AI Agents

### 1. 🔭 Opportunity Radar Agent
Continuously scans the **Nifty 500** universe to identify high-probability trade setups:
- Fetches OHLCV data via **yfinance**
- Computes technical indicators using the **ta** library (RSI, MACD, Bollinger Bands, SMA)
- Detects classical chart patterns (Head & Shoulders, Double Bottom, Bull Flag, etc.)
- Generates confidence-scored signals with AI-powered explanations via **Gemini 1.5**

### 2. 💬 Market Chat AI Agent
An intelligent conversational agent specialized in Indian markets:
- Uses **Gemini 1.5 Flash** (free tier) for fast responses
- Maintains conversation context for multi-turn discussions
- Answers questions about stocks, sectors, macro trends, and investment strategies
- Falls back to **Gemini 1.5 Pro** for complex reasoning tasks

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.109 | REST API framework |
| **Uvicorn** | 0.27 | ASGI server |
| **Google Gemini AI** | 0.7 | AI analysis & chat |
| **yfinance** | 0.2.37 | NSE/BSE market data |
| **ta** | 0.11 | Technical indicators |
| **pandas** | 2.2 | Data manipulation |
| **SQLAlchemy** | 2.0 | ORM / database |
| **APScheduler** | 3.10 | Background task scheduling |
| **notion-client** | 2.2 | Notion API integration |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.2 | React framework (App Router) |
| **TypeScript** | 5.x | Type safety |
| **Framer Motion** | - | Animations & transitions |
| **Recharts** | - | Financial charts |
| **Lucide React** | - | Icons |
| **Three.js** | - | 3D visualizations |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Google Cloud Run** | Serverless container hosting |
| **Google Cloud Build** | CI/CD image builds |
| **Google Container Registry** | Docker image storage |
| **SQLite** | Local development database |
| **PostgreSQL** | Production database (optional) |

---

## 🚀 Deployment

Both services are deployed on **Google Cloud Run** (us-central1):

| Service | URL |
|---------|-----|
| 🖥️ Frontend | https://smart-invest-frontend-382393355294.us-central1.run.app |
| ⚙️ Backend API | https://smart-invest-backend-382393355294.us-central1.run.app |
| 📖 API Docs | https://smart-invest-backend-382393355294.us-central1.run.app/docs |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the Repository
```bash
git clone https://github.com/vrushabhzade/smart-invest-agent.git
cd smart-invest-agent
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### 4. Open the App
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Required
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro

# Database (SQLite for local, PostgreSQL for production)
DATABASE_URL=sqlite:///./market_intelligence.db

# Optional Integrations
NEWS_API_KEY=your_newsapi_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
NOTION_API_KEY=your_notion_token
NOTION_DATABASE_SIGNALS=notion_db_id
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
smart-invest-agent/
├── backend/
│   ├── app/                    # FastAPI app initialization
│   ├── agents/
│   │   ├── opportunity_radar.py # Main scanning agent
│   │   └── market_chat.py       # AI chat agent
│   ├── api/
│   │   ├── market.py            # Market data endpoints
│   │   ├── signals.py           # Signal endpoints
│   │   ├── patterns.py          # Pattern endpoints
│   │   ├── portfolio.py         # Portfolio endpoints
│   │   ├── chat.py              # Chat endpoints
│   │   ├── reels.py             # Video engine endpoints
│   │   └── websocket.py         # WebSocket real-time
│   ├── services/
│   │   ├── market_data.py       # yfinance + ta library
│   │   ├── ai_service.py        # Gemini AI wrapper
│   │   ├── notion_service.py    # Notion sync
│   │   ├── scheduler.py         # Background jobs
│   │   └── rate_limiter.py      # API rate limiting
│   ├── database/                # SQLAlchemy models
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/
│   │   │   ├── views/
│   │   │   │   ├── DashboardView.tsx
│   │   │   │   ├── SignalsView.tsx
│   │   │   │   ├── PatternsView.tsx
│   │   │   │   ├── PortfolioView.tsx
│   │   │   │   ├── ChatView.tsx
│   │   │   │   └── VideoEngineView.tsx
│   │   │   ├── layout/          # Sidebar, navigation
│   │   │   └── 3d/              # Three.js components
│   │   ├── lib/
│   │   │   └── api.ts           # API client
│   │   ├── hooks/               # Custom React hooks
│   │   └── store/               # State management
│   ├── package.json
│   └── Dockerfile
│
└── README.md
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/market/quote/{symbol}` | Get live stock quote |
| `GET` | `/api/market/history/{symbol}` | Get historical OHLCV data |
| `GET` | `/api/signals` | Get AI-generated trading signals |
| `POST` | `/api/signals/scan` | Trigger Nifty 500 scan |
| `GET` | `/api/patterns` | Get detected chart patterns |
| `GET` | `/api/portfolio` | Get portfolio summary |
| `POST` | `/api/chat` | Send message to Market Chat AI |
| `POST` | `/api/reels/generate` | Generate video script |
| `WS` | `/ws` | WebSocket for real-time price updates |
| `GET` | `/docs` | Swagger API documentation |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for Indian retail investors**

⭐ Star this repo if you find it useful!

[![GitHub stars](https://img.shields.io/github/stars/vrushabhzade/smart-invest-agent?style=social)](https://github.com/vrushabhzade/smart-invest-agent)

</div>
