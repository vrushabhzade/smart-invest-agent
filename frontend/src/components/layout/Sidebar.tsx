'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Radar,
  TrendingUp,
  MessageSquare,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Zap,
  Film,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'signals' as const, label: 'Signals', icon: Radar },
  { id: 'patterns' as const, label: 'Patterns', icon: TrendingUp },
  { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
  { id: 'videoEngine' as const, label: 'Video Engine', icon: Film },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen z-50 glass-strong flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-black" />
        </div>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <h1 className="text-sm font-bold text-gradient whitespace-nowrap">SMART INVEST</h1>
            <p className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">AI Intelligence</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-[var(--color-primary)]/15 to-transparent text-[var(--color-primary)] glow-primary'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[var(--color-primary)]' : ''}`} />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && isSidebarOpen && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="mx-2 mb-4 p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors flex items-center justify-center"
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
