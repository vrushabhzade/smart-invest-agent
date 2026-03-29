from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.market_data import MarketDataService
from agents.opportunity_radar import OpportunityRadarAgent
from database.models import SessionLocal
from api.market import fetch_and_cache_all

scheduler = AsyncIOScheduler()

async def scan_for_opportunities():
    """Run every 30 minutes during market hours"""
    print(f"Scanning for opportunities...")
    market = MarketDataService()
    radar = OpportunityRadarAgent()
    symbols = market.get_nse_universe()

    # Scan in batches (rate limit friendly)
    for symbol in symbols[:10]:  # Demo: scan top 10
        try:
            data = market.get_quote(symbol)
            if data and 'price' in data:
                # Check for patterns and signals
                signal = await radar.process_filing({'symbol': symbol, **data})
                if signal:
                    print(f"Signal detected: {symbol} --- {signal['signal_type']}")
        except Exception as e:
            print(f"Error scanning {symbol}: {e}")

async def generate_weekly_report():
    """Run every Sunday at 6 PM"""
    print("Generating weekly portfolio report...")
    # ... report generation logic

def start_scheduler():
    # --- Dashboard Hydration (Critical for Performance) ---
    scheduler.add_job(
        fetch_and_cache_all,
        IntervalTrigger(seconds=60),
        id='market_hydration',
        replace_existing=True
    )

    scheduler.add_job(
        scan_for_opportunities,
        IntervalTrigger(minutes=30),
        id='opportunity_scan',
        replace_existing=True
    )

    scheduler.add_job(
        generate_weekly_report,
        'cron',
        day_of_week='sun',
        hour=18,
        id='weekly_report',
        replace_existing=True
    )

    scheduler.start()
    print("Scheduler started (no Redis needed)")
