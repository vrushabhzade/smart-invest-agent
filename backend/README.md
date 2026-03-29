---
title: Smart Invest Backend
emoji: 📈
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Smart Invest AI - Backend

This is the FastAPI backend for the Smart Invest platform, hosted as a Docker Space on Hugging Face.

## Deployment Key Features
- **FastAPI** + **Uvicorn**
- **Dockerized** for consistent environments
- **Gemini AI** integration
- **Market Data Hydration** via APScheduler

## Required Environment Variables
Ensure the following are set in the Space Settings:
- `GOOGLE_API_KEY`: For Gemini AI
- `FRONTEND_URL`: Your Vercel frontend URL
- `PYTHONIOENCODING`: `utf-8`
