'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Radar,
  Brain,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Briefcase,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

import { useWebSocket } from '@/hooks/useWebSocket';
import { getMarketHistory } from '@/lib/api';

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false });

// ─── Demo Data ───────────────────────────────────
const demoTickers = [
  { symbol: 'RELIANCE', price: 2847.50, change: 32.15, change_percent: 1.14 },
  { symbol: 'TCS', price: 3654.20, change: -18.40, change_percent: -0.50 },
  { symbol: 'HDFCBANK', price: 1723.80, change: 24.60, change_percent: 1.45 },
  { symbol: 'INFY', price: 1542.90, change: 15.30, change_percent: 1.00 },
  { symbol: 'ICICIBANK', price: 1189.30, change: -8.70, change_percent: -0.73 },
  { symbol: 'SBIN', price: 812.45, change: 11.25, change_percent: 1.40 },
  { symbol: 'BHARTIARTL', price: 1687.60, change: 42.80, change_percent: 2.60 },
  { symbol: 'ITC', price: 436.70, change: 3.20, change_percent: 0.74 },
];

// removed static chartData

const demoSignals = [
  { symbol: 'BHARTIARTL', type: 'STRONG_BUY_SIGNAL', strength: 92, insight: 'Strong 5G subscriber growth + tower expansion deal with Data Infrastructure Trust' },
  { symbol: 'RELIANCE', type: 'EARNINGS_SURPRISE', strength: 78, insight: 'Jio Platforms revenue up 18% YoY, refining margins remain elevated' },
  { symbol: 'SBIN', type: 'INSIDER_BUYING_CLUSTER', strength: 85, insight: 'NPA coverage ratio improved to 92%, credit growth at 15.3% YoY' },
];

const demoPatterns = [
  { symbol: 'HDFCBANK', pattern: 'Double Bottom', confidence: 87, direction: 'bullish' },
  { symbol: 'TCS', pattern: 'Ascending Triangle', confidence: 74, direction: 'bullish' },
  { symbol: 'ITC', pattern: 'Head & Shoulders', confidence: 68, direction: 'bearish' },
];

// ─── Stat Card Component ─────────────────────────
function StatCard({ title, value, change, icon: Icon, color, delay }: {
  title: string; value: string; change: string; icon: any; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5 hover:border-[var(--color-border-glow)] transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          change.startsWith('+') ? 'text-[var(--color-success)] bg-[var(--color-success)]/10' : 'text-[var(--color-danger)] bg-[var(--color-danger)]/10'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)] mb-1">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{title}</p>
    </motion.div>
  );
}

// ─── Ticker Strip Component ──────────────────────
function TickerStrip({ tickers }: { tickers: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-3 overflow-hidden"
    >
      <div className="flex gap-6 animate-[scroll_30s_linear_infinite]">
        {[...tickers, ...tickers].map((t, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-bold text-[var(--color-text)]">{t.symbol}</span>
            <span className="text-xs font-mono text-[var(--color-text-dim)]">₹{Number(t.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-xs font-medium flex items-center gap-0.5 ${
              t.change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
            }`}>
              {t.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(Number(t.change_percent)).toFixed(2)}%
            </span>
            <div className="w-px h-4 bg-[var(--color-border)]" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ──────────────────────────────
export default function DashboardView() {
  const [liveTickers, setLiveTickers] = useState(demoTickers);
  const [agentStatus, setAgentStatus] = useState({
    radar: { active: true, scanned: 142, signals: 3 },
    pattern: { active: true, detected: 8, accuracy: 82 },
    chat: { active: true, queries: 47, avgResponse: '1.2s' },
  });

  const [activeChart, setActiveChart] = useState<'nifty' | 'sensex'>('nifty');
  const [chartData, setChartData] = useState<any[]>([]);
  const [marketSummary, setMarketSummary] = useState({
    name: 'NIFTY 50',
    current_price: 22456.80,
    change: 124.5,
    change_percent: 1.23
  });
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsChartLoading(true);
    
    getMarketHistory(activeChart)
      .then(res => {
        if (!isMounted) return;
        setChartData(res.data);
        setMarketSummary({
          name: res.name === 'NIFTY' ? 'NIFTY 50' : 'SENSEX',
          current_price: res.current_price,
          change: res.change,
          change_percent: res.change_percent
        });
      })
      .catch(err => {
        console.error("Failed to load market history:", err);
      })
      .finally(() => {
        if (isMounted) setIsChartLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [activeChart]);

  const { isConnected } = useWebSocket({
    onMarketUpdate: (tickers) => {
      // Merge live tickers with demo tickers so we don't lose any symbols that haven't updated yet
      setLiveTickers((prev) => {
        const liveMap = new Map(tickers.map((t) => [t.symbol, t]));
        return prev.map((p) => liveMap.get(p.symbol) || p);
      });
    },
  });

  return (
    <div className="space-y-5 relative">
      {/* 3D Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <HeroScene />
      </div>

      {/* Market Ticker Strip */}
      <div className="relative">
        <TickerStrip tickers={liveTickers} />
        {isConnected && (
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-success)]"></span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Portfolio Value" value="₹24,56,780" change="+12.4%" icon={Briefcase} color="#00F0FF" delay={0.1} />
        <StatCard title="Active Signals" value="3" change="+2 new" icon={Radar} color="#7B61FF" delay={0.15} />
        <StatCard title="Patterns Detected" value="8" change="+3 today" icon={TrendingUp} color="#00E676" delay={0.2} />
        <StatCard title="AI Queries Today" value="47" change="+15%" icon={Brain} color="#FFAA00" delay={0.25} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nifty 50 Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{marketSummary.name}</h3>
              <p className={`text-2xl font-bold ${marketSummary.change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {marketSummary.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-xs ml-2">
                  {marketSummary.change >= 0 ? '+' : ''}{marketSummary.change_percent.toFixed(2)}%
                </span>
              </p>
            </div>
            <div className="flex bg-[var(--color-surface-card)] p-1 rounded-xl">
              <button 
                onClick={() => setActiveChart('nifty')}
                className={`text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all ${activeChart === 'nifty' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
              >
                NIFTY 50
              </button>
              <button 
                onClick={() => setActiveChart('sensex')}
                className={`text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-all ${activeChart === 'sensex' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
              >
                SENSEX
              </button>
            </div>
          </div>
          {isChartLoading ? (
            <div className="w-full h-[280px] flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={marketSummary.change >= 0 ? "#00E676" : "#FF3366"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={marketSummary.change >= 0 ? "#00E676" : "#FF3366"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} minTickGap={30} />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} width={60} tickFormatter={(val) => Math.floor(val).toString()} />
              <Tooltip
                contentStyle={{
                  background: '#141B2D',
                  border: '1px solid #1E293B',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94A3B8', marginBottom: 4 }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={marketSummary.change >= 0 ? "#00E676" : "#FF3366"} 
                fill="url(#marketGradient)" 
                strokeWidth={2} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </motion.div>

        {/* AI Agent Status Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--color-primary)]" />
            AI Agents Status
          </h3>

          {/* Opportunity Radar */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--color-text)]">Opportunity Radar</span>
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-dim)]">
              <span>{agentStatus.radar.scanned} scanned</span>
              <span>{agentStatus.radar.signals} signals</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[var(--color-surface)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* Pattern AI */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--color-text)]">Chart Pattern AI</span>
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-dim)]">
              <span>{agentStatus.pattern.detected} patterns</span>
              <span>{agentStatus.pattern.accuracy}% accuracy</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[var(--color-surface)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[#FF6B9D]"
              />
            </div>
          </div>

          {/* Market Chat */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--color-text)]">Market ChatGPT</span>
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-dim)]">
              <span>{agentStatus.chat.queries} queries</span>
              <span>{agentStatus.chat.avgResponse} avg</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[var(--color-surface)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ delay: 0.7, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-success)] to-[#00B8A9]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Signals + Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Radar className="w-4 h-4 text-[var(--color-accent)]" />
            Latest Signals
          </h3>
          <div className="space-y-3">
            {demoSignals.map((s, i) => (
              <motion.div
                key={s.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                  ${s.strength >= 85 ? 'bg-[var(--color-success)]/15' : 'bg-[var(--color-warning)]/15'}`}>
                  <span className={`text-sm font-bold ${s.strength >= 85 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                    {s.strength}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--color-text)]">{s.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium">
                      {s.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-dim)] line-clamp-2">{s.insight}</p>
                </div>
                <Eye className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Detected Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-success)]" />
            Detected Patterns
          </h3>
          <div className="space-y-3">
            {demoPatterns.map((p, i) => (
              <motion.div
                key={p.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${p.direction === 'bullish' ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'}`}>
                  {p.direction === 'bullish' ? (
                    <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[var(--color-danger)]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-text)]">{p.symbol}</span>
                    <span className="text-[10px] text-[var(--color-text-dim)]">{p.pattern}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-[var(--color-surface)]">
                      <div
                        className={`h-full rounded-full ${p.direction === 'bullish' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--color-text-dim)]">{p.confidence}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Volume Chart */}
          <div className="mt-4">
            <p className="text-[10px] text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Market Volume (Intraday)</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={chartData.slice(-30)}>
                  <Bar dataKey="volume" fill={marketSummary.change >= 0 ? "#00E676" : "#FF3366"} radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
