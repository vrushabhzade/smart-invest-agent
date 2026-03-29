'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Activity, Target, Shield, BarChart3, Info,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { getPatterns } from '@/lib/api';

const DEMO_PATTERNS = [
  {
    id: 'PAT_001', symbol: 'HDFCBANK', pattern: 'Double Bottom', confidence: 87,
    direction: 'bullish', price: 1723.80, support: 1650.00, resistance: 1800.00,
    target: 1920.00, stopLoss: 1620.00, successRate: 72,
    explanation: 'A classic W-shaped reversal pattern has formed on the daily chart. The stock bounced strongly from ₹1,650 support twice, confirming strong buyer interest. Volume increased 40% on the second bounce, validating the pattern. Historical success rate for this setup is 72%.',
    data: Array.from({ length: 40 }, (_, i) => ({
      x: i, price: 1700 + (i < 10 ? -50 * Math.sin(i * 0.3) : i < 20 ? -80 + i * 3 : i < 30 ? -50 * Math.sin((i - 20) * 0.3) : i * 3),
    })),
  },
  {
    id: 'PAT_002', symbol: 'TCS', pattern: 'Ascending Triangle', confidence: 74,
    direction: 'bullish', price: 3654.20, support: 3500.00, resistance: 3700.00,
    target: 3900.00, stopLoss: 3460.00, successRate: 68,
    explanation: 'Price is making higher lows while testing ₹3,700 resistance repeatedly. The ascending trendline from ₹3,400 provides strong dynamic support. A breakout above ₹3,700 with volume could trigger a measured move to ₹3,900.',
    data: Array.from({ length: 40 }, (_, i) => ({
      x: i, price: 3500 + i * 5 + Math.sin(i * 0.5) * 30,
    })),
  },
  {
    id: 'PAT_003', symbol: 'ITC', pattern: 'Head & Shoulders', confidence: 68,
    direction: 'bearish', price: 436.70, support: 420.00, resistance: 460.00,
    target: 400.00, stopLoss: 465.00, successRate: 64,
    explanation: 'A bearish Head & Shoulders pattern has formed with the neckline at ₹420. The right shoulder is forming at a lower level than the left, suggesting selling pressure. If the neckline breaks, the measured target is ₹400.',
    data: Array.from({ length: 40 }, (_, i) => ({
      x: i, price: 440 + (i < 12 ? Math.sin(i * 0.5) * 15 : i < 25 ? Math.sin(i * 0.4) * 25 : Math.sin(i * 0.5) * 12 - (i - 25) * 0.5),
    })),
  },
  {
    id: 'PAT_004', symbol: 'BAJFINANCE', pattern: 'Bull Flag', confidence: 81,
    direction: 'bullish', price: 7230.00, support: 7000.00, resistance: 7500.00,
    target: 8000.00, stopLoss: 6900.00, successRate: 75,
    explanation: 'After a sharp 12% rally, price consolidated in a tight downward channel forming a bull flag. Volume dried up during consolidation (classic sign). Breakout above ₹7,500 flag resistance projects a target of ₹8,000.',
    data: Array.from({ length: 40 }, (_, i) => ({
      x: i, price: i < 15 ? 6800 + i * 30 : 7250 - (i - 15) * 5 + Math.sin(i * 0.8) * 20,
    })),
  },
];

export default function PatternsView() {
  const [patterns, setPatterns] = useState(DEMO_PATTERNS);
  const [selected, setSelected] = useState(DEMO_PATTERNS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPatterns();
        if (res.patterns && res.patterns.length > 0) {
          const mapped = res.patterns.map(p => {
            const isBullish = p.target_price > p.price_at_detection;
            const demoMatch = DEMO_PATTERNS.find(d => d.symbol === p.symbol);
            
            return {
              id: p.id || Math.random().toString(),
              symbol: p.symbol,
              pattern: p.pattern_type,
              confidence: p.confidence || 50,
              direction: isBullish ? 'bullish' : 'bearish',
              price: p.price_at_detection || 0,
              support: p.support_level || 0,
              resistance: p.resistance_level || 0,
              target: p.target_price || 0,
              stopLoss: p.stop_loss || 0,
              successRate: p.historical_success_rate || 50,
              explanation: p.explanation || 'No explanation available',
              // Use demo data chart points if symbol matches, else generate a generic visual
              data: demoMatch ? demoMatch.data : Array.from({ length: 40 }, (_, i) => ({
                x: i, price: p.price_at_detection * (1 + (isBullish ? 1 : -1) * 0.001 * i * Math.sin(i * 0.2)),
              })),
            };
          });
          setPatterns(mapped);
          if (mapped.length > 0) {
            setSelected(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live patterns, using demo data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const active = patterns.find(p => p.id === selected) || patterns[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--color-success)]" />
          Chart Pattern AI
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">AI-detected chart patterns with confidence scores and price targets</p>
      </div>

      {/* Pattern Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {patterns.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(p.id)}
            className={`p-4 rounded-2xl text-left transition-all duration-200 ${
              selected === p.id
                ? 'glass-strong glow-accent border-[var(--color-accent)]/30'
                : 'glass hover:border-[var(--color-border-glow)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--color-text)]">{p.symbol}</span>
              {p.direction === 'bullish' ? (
                <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--color-danger)]" />
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-dim)] mb-2">{p.pattern}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface)]">
                <div
                  className={`h-full rounded-full ${p.direction === 'bullish' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}
                  style={{ width: `${p.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{p.confidence}%</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail View */}
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">{active.symbol} — {active.pattern}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">₹{active.price.toLocaleString()} · Confidence: {active.confidence}%</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              active.direction === 'bullish'
                ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
            }`}>
              {active.direction.toUpperCase()}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={active.data}>
              <defs>
                <linearGradient id="patternGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={active.direction === 'bullish' ? '#00E676' : '#FF3D71'} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={active.direction === 'bullish' ? '#00E676' : '#FF3D71'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="x" hide />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{ background: '#141B2D', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12 }} />
              <ReferenceLine y={active.support} stroke="#FFAA00" strokeDasharray="5 5" label={{ value: `Support ₹${active.support}`, fill: '#FFAA00', fontSize: 10 }} />
              <ReferenceLine y={active.resistance} stroke="#7B61FF" strokeDasharray="5 5" label={{ value: `Resistance ₹${active.resistance}`, fill: '#7B61FF', fontSize: 10 }} />
              <Area type="monotone" dataKey="price" stroke={active.direction === 'bullish' ? '#00E676' : '#FF3D71'} fill="url(#patternGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          {/* Price Levels */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              Price Levels
            </h4>
            {[
              { label: 'Target', value: active.target, color: 'text-[var(--color-success)]' },
              { label: 'Resistance', value: active.resistance, color: 'text-[var(--color-accent)]' },
              { label: 'Current', value: active.price, color: 'text-[var(--color-text)]' },
              { label: 'Support', value: active.support, color: 'text-[var(--color-warning)]' },
              { label: 'Stop Loss', value: active.stopLoss, color: 'text-[var(--color-danger)]' },
            ].map(l => (
              <div key={l.label} className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-dim)]">{l.label}</span>
                <span className={`text-xs font-mono font-medium ${l.color}`}>₹{l.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Pattern Stats
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-dim)]">Historic Success</span>
              <span className="text-xs font-medium text-[var(--color-success)]">{active.successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-dim)]">Risk/Reward</span>
              <span className="text-xs font-medium text-[var(--color-primary)]">
                1:{((active.target - active.price) / (active.price - active.stopLoss)).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-dim)]">Upside</span>
              <span className="text-xs font-medium text-[var(--color-success)]">
                +{((active.target - active.price) / active.price * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="glass rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              AI Explanation
            </h4>
            <p className="text-[11px] text-[var(--color-text-dim)] leading-relaxed">{active.explanation}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
