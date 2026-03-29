# 📊 Smart Invest AI Platform

[![Built with FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Built with Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![AI Powered by Gemini](https://img.shields.io/badge/Gemini_AI-8E75FF?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**Smart Invest** is a high-performance, AI-driven stock market intelligence platform designed specifically for the Indian equity markets (NSE/BSE). It combines real-time data streaming, technical pattern recognition, and LLM-powered insights to provide retail investors with institutional-grade tools.

![Dashboard Preview](https://raw.githubusercontent.com/vrushabhzade/smart-invest-agent/main/preview.png) *(Preview placeholder)*

## 🚀 Key Features

### 📡 Opportunity Radar (AI Agent)
Autonomous agents that scan thousands of data points to detect high-confidence buy/sell signals. Uses Gemini AI to provide context-aware insights on why a signal was triggered.

### 📐 Chart Pattern AI
Real-time technical analysis engine that automatically identifies classic patterns:
- Double Bottoms / Tops
- Ascending / Descending Triangles
- Head & Shoulders
- Support/Resistance breakouts

### 💬 Market ChatGPT
A dedicated financial AI assistant capable of:
- Analyzing stock-specific news and sentiments.
- Explaining complex company earnings.
- Providing real-time quotes and historical comparisons.

### 🎞️ Video Engine (AI Reels)
Generate viral-ready social media scripts (Instagram Reels/YouTube Shorts) in seconds. The engine analyzes daily market trends and creates context-rich, 3-part scripts for content creators.

### ⚡ Performance Optimized
- **Sub-50ms Dashboard Loads**: Advanced background data hydration using APScheduler.
- **Real-time Updates**: WebSocket integration for live price streaming and signal alerts.
- **3D Immersive UI**: Premium dark-mode aesthetic with Three.js and Framer Motion.

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (Turbopack), Tailwind CSS, Framer Motion, Recharts, Three.js (React Three Fiber), Zustand.
- **Backend**: FastAPI (Python 3.13), yfinance, Google Gemini AI SDK, SQLAlchemy.
- **Infrastructure**: Dockerized (Cloud Run ready), PostgreSQL/SQLite support.

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with GOOGLE_API_KEY
python -m app.main
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
Built with ❤️ by [Vrushabh Zade](https://github.com/vrushabhzade)
