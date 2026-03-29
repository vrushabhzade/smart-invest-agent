'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Header() {
  const { activeTab, isSidebarOpen } = useAppStore();
  const [isConnected] = React.useState(true);
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<string, string> = {
    dashboard: 'Command Center',
    signals: 'Opportunity Radar',
    patterns: 'Chart Pattern AI',
    chat: 'Market ChatGPT',
    portfolio: 'Portfolio Intelligence',
  };

  return (
    <header
      className="fixed top-0 right-0 z-40 h-16 glass-strong border-b border-[var(--color-border)] flex items-center justify-between px-6"
      style={{ left: isSidebarOpen ? 240 : 72 }}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {titles[activeTab]}
        </h2>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          {isConnected ? (
            <Wifi className="w-3 h-3 text-[var(--color-success)]" />
          ) : (
            <WifiOff className="w-3 h-3 text-[var(--color-danger)]" />
          )}
          <span className="text-[10px] text-[var(--color-text-dim)]">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] w-60">
          <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search stocks, signals..."
            className="bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none w-full"
          />
          <kbd className="text-[9px] text-[var(--color-text-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>

        {/* Clock */}
        <div className="text-xs font-mono text-[var(--color-primary)] bg-[var(--color-surface-card)] px-3 py-1.5 rounded-lg border border-[var(--color-border-glow)]">
          {time || '--:--:--'}
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Bell className="w-4 h-4 text-[var(--color-text-dim)]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
        </motion.button>
      </div>
    </header>
  );
}
