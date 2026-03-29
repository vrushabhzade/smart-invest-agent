'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  PieChart, BarChart3, Target, Shield, Plus,
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { getPortfolio } from '@/lib/api';

const DEFAULT_PORTFOLIO_DATA = {
  totalValue: 2456780,
  totalInvested: 2180000,
  totalReturn: 276780,
  returnPercent: 12.69,
  todayChange: 15420,
  todayPercent: 0.63,
};

const DEMO_HOLDINGS = [
  { symbol: 'RELIANCE', name: 'Reliance Ind.', qty: 50, avgPrice: 2600, currentPrice: 2847.50, sector: 'Conglomerate', weight: 23.4, isWatchlist: false },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', qty: 100, avgPrice: 1580, currentPrice: 1723.80, sector: 'Banking', weight: 28.3, isWatchlist: false },
  { symbol: 'TCS', name: 'TCS', qty: 30, avgPrice: 3400, currentPrice: 3654.20, sector: 'IT', weight: 18.0, isWatchlist: false },
  { symbol: 'INFY', name: 'Infosys', qty: 60, avgPrice: 1420, currentPrice: 1542.90, sector: 'IT', weight: 15.2, isWatchlist: false },
  { symbol: 'ITC', name: 'ITC Ltd', qty: 200, avgPrice: 410, currentPrice: 436.70, sector: 'FMCG', weight: 14.3, isWatchlist: false },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', qty: 0, avgPrice: 0, currentPrice: 1687.60, sector: 'Telecom', weight: 0, isWatchlist: true },
];

const DEMO_SECTOR_ALLOCATION = [
  { name: 'Banking', value: 28.3, color: '#00F0FF' },
  { name: 'Conglomerate', value: 23.4, color: '#7B61FF' },
  { name: 'IT', value: 33.2, color: '#00E676' },
  { name: 'FMCG', value: 14.3, color: '#FFAA00' },
];

const DEFAULT_PERFORMANCE_HISTORY = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  value: 2180000 + i * 1500 + Math.sin(i * 0.2) * 20000 + Math.random() * 10000,
}));

export default function PortfolioView() {
  const [portfolioData, setPortfolioData] = useState(DEFAULT_PORTFOLIO_DATA);
  const [holdings, setHoldings] = useState(DEMO_HOLDINGS);
  const [sectorAllocation, setSectorAllocation] = useState(DEMO_SECTOR_ALLOCATION);
  const [performanceHistory, setPerformanceHistory] = useState(DEFAULT_PERFORMANCE_HISTORY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPortfolio();
        if (res.summary && res.holdings) {
          setPortfolioData({
            totalValue: res.summary.total_value || DEFAULT_PORTFOLIO_DATA.totalValue,
            totalInvested: res.summary.total_invested || DEFAULT_PORTFOLIO_DATA.totalInvested,
            totalReturn: res.summary.total_return || DEFAULT_PORTFOLIO_DATA.totalReturn,
            returnPercent: res.summary.return_percent || DEFAULT_PORTFOLIO_DATA.returnPercent,
            todayChange: DEFAULT_PORTFOLIO_DATA.todayChange, // Simulated for now
            todayPercent: DEFAULT_PORTFOLIO_DATA.todayPercent,
          });

          const mappedHoldings = res.holdings.map((h: any) => ({
            symbol: h.symbol,
            name: h.name || h.symbol,
            qty: h.qty,
            avgPrice: h.avg_price,
            currentPrice: h.current_price,
            sector: h.sector || 'Unknown',
            weight: h.weight,
            isWatchlist: h.qty === 0,
          }));
          setHoldings(mappedHoldings);

          // Calculate sector allocation based on weight
          const sectorMap: Record<string, number> = {};
          mappedHoldings.forEach((h: any) => {
            if (!h.isWatchlist) {
              sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.weight;
            }
          });
          
          const colors = ['#00F0FF', '#7B61FF', '#00E676', '#FFAA00', '#FF3D71', '#F5A623'];
          const newAllocations = Object.entries(sectorMap)
            .sort((a, b) => b[1] - a[1]) // Sort by weight descending
            .map(([name, value], i) => ({
              name,
              value: Math.round(value * 10) / 10, // Round to 1 decimal
              color: colors[i % colors.length]
            }));
            
          if (newAllocations.length > 0) {
            setSectorAllocation(newAllocations);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live portfolio, using demo data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--color-primary)]" />
            Portfolio Intelligence
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">AI-powered portfolio tracking and analysis</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-black text-xs font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />
          Add Holding
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Value</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">₹{(portfolioData.totalValue / 100000).toFixed(2)}L</p>
          <p className="text-xs text-[var(--color-success)] flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            +₹{(portfolioData.todayChange).toLocaleString()} today
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Return</p>
          <p className="text-2xl font-bold text-[var(--color-success)]">+{portfolioData.returnPercent.toFixed(2)}%</p>
          <p className="text-xs text-[var(--color-text-dim)]">₹{(portfolioData.totalReturn).toLocaleString()} profit</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Invested</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">₹{(portfolioData.totalInvested / 100000).toFixed(2)}L</p>
          <p className="text-xs text-[var(--color-text-dim)]">5 holdings</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Today&apos;s P&L</p>
          <p className="text-2xl font-bold text-[var(--color-success)]">+{portfolioData.todayPercent}%</p>
          <p className="text-xs text-[var(--color-success)] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Market is bullish
          </p>
        </motion.div>
      </div>

      {/* Charts + Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text)]">Portfolio Performance (90 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={performanceHistory}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
              <Tooltip
                contentStyle={{ background: '#141B2D', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12 }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#00E676" fill="url(#portGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sector Allocation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text)] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[var(--color-accent)]" />
            Sector Allocation
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <RePieChart>
              <Pie data={sectorAllocation} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {sectorAllocation.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sectorAllocation.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[11px] text-[var(--color-text-dim)]">{s.name}</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-text)]">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4 text-[var(--color-text)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />
          Holdings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-medium">Stock</th>
                <th className="text-right py-2 font-medium">Qty</th>
                <th className="text-right py-2 font-medium">Avg Price</th>
                <th className="text-right py-2 font-medium">CMP</th>
                <th className="text-right py-2 font-medium">P&L</th>
                <th className="text-right py-2 font-medium">Return</th>
                <th className="text-right py-2 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {holdings.filter(h => !h.isWatchlist).map((h, i) => {
                const pnl = (h.currentPrice - h.avgPrice) * h.qty;
                const returnPct = ((h.currentPrice - h.avgPrice) / h.avgPrice * 100);
                return (
                  <motion.tr
                    key={h.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                  >
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-[var(--color-text)]">{h.symbol}</span>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{h.sector}</p>
                      </div>
                    </td>
                    <td className="text-right text-[var(--color-text-dim)]">{h.qty}</td>
                    <td className="text-right font-mono text-[var(--color-text-dim)]">₹{h.avgPrice.toLocaleString()}</td>
                    <td className="text-right font-mono text-[var(--color-text)]">₹{h.currentPrice.toLocaleString()}</td>
                    <td className={`text-right font-mono font-medium ${pnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                      {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
                    </td>
                    <td className={`text-right font-medium ${returnPct >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                      <span className="flex items-center justify-end gap-0.5">
                        {returnPct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {returnPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right text-[var(--color-text-dim)]">{h.weight}%</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
