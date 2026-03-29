'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/store/useAppStore';

const Sidebar = dynamic(() => import('@/components/layout/Sidebar'), { ssr: false });
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const DashboardView = dynamic(() => import('@/components/views/DashboardView'), { ssr: false });
const SignalsView = dynamic(() => import('@/components/views/SignalsView'), { ssr: false });
const PatternsView = dynamic(() => import('@/components/views/PatternsView'), { ssr: false });
const ChatView = dynamic(() => import('@/components/views/ChatView'), { ssr: false });
const PortfolioView = dynamic(() => import('@/components/views/PortfolioView'), { ssr: false });
const VideoEngineView = dynamic(() => import('@/components/views/VideoEngineView'), { ssr: false });

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  signals: SignalsView,
  patterns: PatternsView,
  chat: ChatView,
  portfolio: PortfolioView,
  videoEngine: VideoEngineView,
};

export default function HomePage() {
  const { activeTab, isSidebarOpen } = useAppStore();
  const ActiveView = views[activeTab] || DashboardView;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] grid-bg">
      <Sidebar />
      <Header />

      <main
        className="pt-20 pb-8 px-6 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 240 : 72 }}
      >
        <ActiveView />
      </main>
    </div>
  );
}
