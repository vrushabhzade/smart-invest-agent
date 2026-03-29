'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar, Filter, ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, TrendingUp, ChevronRight,
} from 'lucide-react';
import { getSignals } from '@/lib/api';

const DEMO_SIGNALS = [
  {
    id: 'SIG_001', symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom',
    type: 'STRONG_BUY_SIGNAL', strength: 92, price: 1687.60, change: 2.6,
    insight: 'Massive 5G subscriber growth with 30M new users in Q3. Tower monetization deal with Data Infrastructure Trust valued at ₹25,200 Cr. ARPU expected to cross ₹250 by Q4.',
    reasoning: ['5G subscriber additions accelerating', 'ARPU up 8% QoQ to ₹233', 'Tower deal unlocks capital'],
    risks: ['Spectrum auction costs', 'Jio price competition'],
    time: '2 min ago',
  },
  {
    id: 'SIG_002', symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking',
    type: 'INSIDER_BUYING_CLUSTER', strength: 85, price: 812.45, change: 1.4,
    insight: 'NPA coverage ratio improved to 92%. Credit growth at 15.3% YoY outpacing industry. Multiple senior executives purchased shares in open market worth ₹4.2Cr.',
    reasoning: ['NPA decline trend for 8 quarters', 'Senior executive buying cluster', 'Credit growth above industry average'],
    risks: ['Rural NPA concerns', 'Rate cut impact on NIMs'],
    time: '15 min ago',
  },
  {
    id: 'SIG_003', symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Conglomerate',
    type: 'EARNINGS_SURPRISE', strength: 78, price: 2847.50, change: 1.14,
    insight: 'Jio Platforms revenue surged 18% YoY. Retail segment EBITDA margin expansion to 8.2%. O2C segment benefits from elevated crack spreads.',
    reasoning: ['Jio revenue beat estimates by 5%', 'Retail margin expansion surprising', 'Strong refining margins'],
    risks: ['New energy capex timeline risk', 'Retail competition intensifying'],
    time: '1 hr ago',
  },
  {
    id: 'SIG_004', symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals',
    type: 'OPPORTUNITY_DETECTED', strength: 65, price: 142.30, change: -0.82,
    insight: 'European operations turning corner with cost restructuring. India operations posting record EBITDA/ton of ₹16,500. China reopening boosting steel demand outlook.',
    reasoning: ['India EBITDA/ton at record', 'European restructuring progress', 'China demand recovery'],
    risks: ['European energy costs', 'China dumping concerns', 'Iron ore price volatility'],
    time: '3 hrs ago',
  },
];

function getRelativeTime(dateString: string | null) {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getSignalColor(strength: number) {
  if (strength >= 85) return { bg: 'bg-[var(--color-success)]/15', text: 'text-[var(--color-success)]', border: 'border-[var(--color-success)]/20' };
  if (strength >= 70) return { bg: 'bg-[var(--color-primary)]/15', text: 'text-[var(--color-primary)]', border: 'border-[var(--color-primary)]/20' };
  return { bg: 'bg-[var(--color-warning)]/15', text: 'text-[var(--color-warning)]', border: 'border-[var(--color-warning)]/20' };
}

export default function SignalsView() {
  const [signals, setSignals] = useState(DEMO_SIGNALS);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(DEMO_SIGNALS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getSignals();
        if (res.signals && res.signals.length > 0) {
          const mapped = res.signals.map(s => {
            const demo = DEMO_SIGNALS.find(d => d.symbol === s.symbol) || ({} as any);
            return {
              id: s.signal_id,
              symbol: s.symbol,
              name: demo.name || s.symbol,
              sector: demo.sector || 'Market',
              type: s.signal_type || 'OPPORTUNITY',
              strength: s.strength || 50,
              price: demo.price || 0,
              change: demo.change || 0,
              insight: s.actionable_insight || 'No insight provided.',
              reasoning: s.reasoning || [],
              risks: s.risk_factors || [],
              time: getRelativeTime(s.created_at),
            };
          });
          setSignals(mapped);
          if (mapped.length > 0) {
            setSelectedSignal(mapped[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live signals, using demo data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const active = signals.find(s => s.id === selectedSignal);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Radar className="w-5 h-5 text-[var(--color-accent)]" />
            Opportunity Radar
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">AI-detected investment signals from filings, news, and market data</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Signal List */}
        <div className="lg:col-span-2 space-y-3">
          {signals.map((s, i) => {
            const colors = getSignalColor(s.strength);
            const isSelected = selectedSignal === s.id;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedSignal(s.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'glass-strong glow-primary border-[var(--color-primary)]/30'
                    : 'glass hover:border-[var(--color-border-glow)]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                      <span className={`text-sm font-bold ${colors.text}`}>{s.strength}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[var(--color-text)]">{s.symbol}</span>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{s.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-[var(--color-text-dim)]">₹{s.price.toLocaleString()}</span>
                    <p className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                      s.change >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      {s.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(s.change)}%
                    </p>
                  </div>
                </div>
                <span className={`inline-block text-[9px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} mb-2`}>
                  {s.type.replace(/_/g, ' ')}
                </span>
                <p className="text-[11px] text-[var(--color-text-dim)] line-clamp-2">{s.insight}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-text-muted)]">
                  <Clock className="w-3 h-3" />
                  {s.time}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Signal Detail */}
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 glass rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-[var(--color-text)]">{active.symbol}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getSignalColor(active.strength).bg} ${getSignalColor(active.strength).text}`}>
                    {active.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{active.name} · {active.sector}</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${getSignalColor(active.strength).bg}`}>
                <span className={`text-2xl font-bold ${getSignalColor(active.strength).text}`}>{active.strength}</span>
                <span className="text-[8px] text-[var(--color-text-muted)]">SCORE</span>
              </div>
            </div>

            {/* Actionable Insight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border border-[var(--color-primary)]/10">
              <h4 className="text-xs font-semibold text-[var(--color-primary)] mb-2 uppercase tracking-wider">Actionable Insight</h4>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{active.insight}</p>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" />
                Key Reasoning
              </h4>
              <div className="space-y-2">
                {active.reasoning.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-dim)]">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-success)] mt-0.5 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-text)] mb-3 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)]" />
                Risk Factors
              </h4>
              <div className="space-y-2">
                {active.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-dim)]">
                    <AlertTriangle className="w-3 h-3 text-[var(--color-warning)] mt-0.5 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
