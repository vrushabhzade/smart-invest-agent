'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, Settings, Play, Download, Clock, Zap, Target,
  TrendingUp, BarChart3, Activity, PieChart, Shield,
  Mic, Music, MonitorPlay, MessageSquareText, History
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ApiService } from '@/lib/api';

type MediaType = 'wrap' | 'sector' | 'fiidii' | 'ipo';
type ConfigTab = 'content' | 'audio' | 'script';

const mockVideoData = Array.from({ length: 40 }, (_, i) => ({
  x: i, y: 1000 + i * 20 + Math.sin(i * 0.4) * 200,
}));

export default function VideoEngineView() {
  const [activeType, setActiveType] = useState<MediaType>('wrap');
  const [activeTab, setActiveTab] = useState<ConfigTab>('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  
  // Real Reel State
  const [reelContent, setReelContent] = useState<{
    headline: string;
    script: { time: string; text: string; visual: string }[];
    dynamic_data: any;
  } | null>(null);

  // Fake settings state
  const [voice, setVoice] = useState('analytical');
  const [music, setMusic] = useState('electronic');

  // Simulated render loop (coupled with real API fetch)
  useEffect(() => {
    if (isGenerating && progress < 100) {
      const timer = setTimeout(() => {
        // Fast progress while waiting for API, then slows down
        const increment = progress > 70 ? 0.5 : (Math.random() * 5 + 3);
        setProgress(p => Math.min(p + increment, 98));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, progress]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsDone(false);
    setProgress(0);
    setReelContent(null);

    const typeLabels: Record<MediaType, string> = {
      wrap: 'Daily Market Wrap',
      sector: 'Sector Rotation',
      fiidii: 'FII / DII Flow',
      ipo: 'IPO Tracker'
    };

    try {
      const data = await ApiService.generateReelContent(typeLabels[activeType]);
      setReelContent(data);
      setProgress(100);
      
      // Short delay for "Rendering Done" effect
      setTimeout(() => {
        setIsGenerating(false);
        setIsDone(true);
      }, 800);
    } catch (error) {
      console.error('Reel generation failed:', error);
      setIsGenerating(false);
    }
  };

  const types: { id: MediaType; label: string; icon: any; color: string; desc: string }[] = [
    { 
      id: 'wrap', label: 'Daily Market Wrap', icon: Activity, color: '#00F0FF', 
      desc: 'Auto-compile daily highs, lows, and key news into a 60s summary.',
    },
    { 
      id: 'sector', label: 'Sector Rotation', icon: PieChart, color: '#7B61FF', 
      desc: 'Visual race-chart showing sector momentum over the past week.',
    },
    { 
      id: 'fiidii', label: 'FII / DII Flow', icon: BarChart3, color: '#00E676', 
      desc: 'Institutional cash flow visualized as dynamic particle animations.',
    },
    { 
      id: 'ipo', label: 'IPO Tracker', icon: Zap, color: '#FFAA00', 
      desc: 'Overview of upcoming IPOs, subscriptions, and grey market premiums.',
    },
  ];

  const currentHeadline = reelContent?.headline || "PREPARING CONTENT...";
  const currentScript = reelContent?.script?.[0]?.text || "Initializing AI Script Engine...";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient flex items-center gap-3">
            <Film className="w-7 h-7 text-[var(--color-primary)]" />
            AI Market Video Engine <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 font-mono ml-2 relative -top-1">v2.1 LIVE</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Generate stunning, data-driven vertical videos with zero human editing.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm font-semibold hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-all">
            <History className="w-4 h-4" />
            Render History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Console (4 Columns) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="glass rounded-2xl p-5 flex-1 flex flex-col">
            
            {/* Tabs */}
            <div className="flex bg-[#0F172A] p-1 rounded-xl border border-[var(--color-border)] mb-5">
              <button 
                onClick={() => setActiveTab('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'content' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >
                <Target className="w-3.5 h-3.5" /> Content
              </button>
              <button 
                onClick={() => setActiveTab('audio')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'audio' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >
                <Mic className="w-3.5 h-3.5" /> Audio
              </button>
              <button 
                onClick={() => setActiveTab('script')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'script' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >
                <MessageSquareText className="w-3.5 h-3.5" /> Script
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'content' && (
                  <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Select Template</h3>
                    {types.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { if(!isGenerating) setActiveType(t.id) }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          activeType === t.id 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 glow-sm' 
                            : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)]/50 hover:bg-[#0F172A]'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg" style={{ background: `${t.color}15` }}>
                            <t.icon className="w-5 h-5" style={{ color: t.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{t.label}</p>
                            <p className="text-xs text-[var(--color-text-dim)] mt-1 line-clamp-1">{t.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'audio' && (
                  <motion.div key="audio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">AI Voiceover Profile</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['analytical', 'energetic', 'professional', 'urgent'].map(v => (
                          <div 
                            key={v}
                            onClick={() => setVoice(v)}
                            className={`p-3 rounded-xl text-center text-xs font-semibold capitalize cursor-pointer transition-all border ${
                              voice === v ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-[#0F172A]'
                            }`}
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
                        <Music className="w-3.5 h-3.5" /> Background Motif
                      </h3>
                      <div className="space-y-2">
                        {['electronic', 'ambient', 'orchestral'].map(m => (
                          <div 
                            key={m}
                            onClick={() => setMusic(m)}
                            className={`p-3 rounded-xl text-xs font-medium capitalize flex justify-between items-center cursor-pointer transition-all border ${
                              music === m ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:bg-[#0F172A]'
                            }`}
                          >
                            <span className={music === m ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}>{m} Beat</span>
                            {music === m && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'script' && (
                  <motion.div key="script" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                     <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex justify-between">
                        Generated Script
                        <span className="text-[var(--color-primary)] font-mono normal-case tracking-normal hover:underline cursor-pointer">Edit</span>
                     </h3>
                     <div className="bg-[#020617] border border-[var(--color-border)] rounded-xl p-4 relative group min-h-[150px]">
                        <p className="text-sm text-[var(--color-text)] leading-relaxed font-medium">
                          {isGenerating ? (
                            <span className="animate-pulse">Analyzing market conditions and generating script...</span>
                          ) : (
                            <>
                              <span className="text-[var(--color-accent)] font-mono">[{activeType.toUpperCase()}]</span><br/><br/>
                              {currentScript}
                            </>
                          )}
                        </p>
                     </div>
                     <p className="text-[10px] text-[var(--color-text-dim)] mt-3">This script is dynamically generated by the `Market ChatGPT` agent based on real-time data.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[var(--color-border)] group hover:border-[var(--color-border-hover)] transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Auto-Scheduler</p>
                  <p className="text-[10px] text-[var(--color-text-dim)]">Off • Manual trigger only</p>
                </div>
                <div className="w-8 h-4 bg-gray-700 rounded-full relative">
                   <div className="w-3 h-3 bg-gray-400 rounded-full absolute left-0.5 top-0.5" />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-black font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-70 group hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-4 h-4 animate-bounce" />
                    Rendering Video...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Generate HD Reel
                  </>
                )}
                
                {/* Embedded Progress Bar */}
                {isGenerating && (
                  <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                    <div className="h-full bg-white transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Console (8 Cols) */}
        <div className="lg:col-span-8 glass flex flex-col rounded-2xl overflow-hidden border border-[var(--color-border)] h-[650px] relative shadow-lg">
          {/* Internal Video Header */}
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[#0F172A]/90 backdrop-blur-md z-10">
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-[var(--color-accent)]" />
              Preview Canvas <span className="text-[10px] text-[var(--color-text-dim)] font-mono ml-2">1080x1920 (9:16)</span>
            </h3>
            <div className="flex items-center gap-3">
              {isDone && (
                <button className="text-xs font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] px-4 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[var(--color-success)]/20 transition-all border border-[var(--color-success)]/20 hover:scale-105">
                  <Download className="w-4 h-4" />
                  Export .MP4
                </button>
              )}
              <span className="text-[11px] font-medium text-[var(--color-text-dim)] flex items-center gap-1 bg-[#020617] px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                Est. Run: 58s
              </span>
            </div>
          </div>

          {/* Video Mockup Area */}
          <div className="flex-1 relative bg-[#020617] flex items-center justify-center overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 grid-bg opacity-40" />
            
            <AnimatePresence mode="wait">
              {!isGenerating && !isDone && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center z-10 p-8 rounded-2xl bg-[#0F172A]/50 backdrop-blur-sm border border-[var(--color-border)] shadow-2xl"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent flex items-center justify-center mx-auto mb-5 border border-[var(--color-primary)]/40 relative">
                     <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/10 animate-ping" />
                     <Play className="w-8 h-8 text-[var(--color-primary)] ml-1 relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Engine Standing By</h3>
                  <p className="text-sm text-[var(--color-text-dim)] max-w-sm mx-auto">
                    Select a template and hit Generate to compile data points into a high-quality vertical social media clip.
                  </p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#020617]/80 backdrop-blur-sm"
                >
                  {/* Abstract rendering visuals */}
                  <div className="relative w-56 h-56 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-t-2 border-[var(--color-primary)] border-r-2 border-transparent opacity-80 shadow-[0_0_40px_rgba(0,240,255,0.4)]"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }} 
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-6 rounded-full border-b-2 border-[var(--color-accent)] border-l-2 border-transparent opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-5xl font-black font-mono text-[var(--color-text)] drop-shadow-md">
                        {Math.floor(progress)}<span className="text-2xl text-[var(--color-text-muted)]">%</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-[var(--color-primary)] animate-pulse tracking-widest uppercase font-bold">
                    {progress < 70 ? 'Fetching Market Data...' : 'Synthesizing AI Content...'}
                  </p>
                  
                  {/* Fake log output */}
                  <div className="mt-8 text-[10px] font-mono text-[var(--color-text-dim)] opacity-50 space-y-1 w-64">
                    <p>[SYS] Injecting WebGL context</p>
                    <p>[SYS] Generating text overlays</p>
                    <p>[SYS] Fetching live ticker variables...</p>
                    <p className={`transition-colors ${progress > 40 ? 'text-[var(--color-success)]' : ''}`}>
                      {progress > 40 ? '✓ Tickers loaded (14ms)' : '...waiting for market API'}
                    </p>
                  </div>
                </motion.div>
              )}

              {isDone && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center z-10 py-6"
                >
                  {/* Simulated vertical video player */}
                  <div className="w-[300px] h-[540px] bg-[#0A0F1D] rounded-[32px] border-[6px] border-[#1E293B] overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    
                    {/* Fake Video UI Overlay */}
                    <div className="absolute top-5 left-4 right-4 flex justify-between items-center z-20">
                      <div className="bg-red-500/90 backdrop-blur-md px-2.5 py-1 rounded shadow-lg text-[10px] font-black tracking-wider text-white flex items-center gap-1.5 border border-red-400/50">
                        <Activity className="w-3 h-3 text-white animate-pulse" />
                        LIVE 
                      </div>
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center">
                         <div className="text-white text-[10px] font-bold">AI</div>
                      </div>
                    </div>

                    {/* Generative Visual Content Background */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-10"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    />
                    
                    {/* Dynamic floating elements behind text */}
                    <motion.div
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 0.15, scale: 1 }}
                       transition={{ delay: 0.2, duration: 1 }}
                       className="absolute top-1/4 -right-12"
                    >
                       {React.createElement(types.find(t => t.id === activeType)?.icon || Activity, {
                         className: "w-48 h-48",
                         style: { color: types.find(t => t.id === activeType)?.color || '#00F0FF' }
                       })}
                    </motion.div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-20">
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                        className="mb-3 inline-block"
                      >
                         <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50 backdrop-blur-sm">
                            {types.find(t => t.id === activeType)?.label}
                         </span>
                      </motion.div>

                      <motion.h4 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                        className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-2xl uppercase"
                      >
                        {currentHeadline}
                      </motion.h4>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}
                        className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 mb-4 shadow-xl"
                      >
                         <p className="text-xs text-gray-200 font-medium leading-relaxed">
                           "{currentScript.split(' ').slice(0, 15).join(' ')}..."
                         </p>
                      </motion.div>
                      
                      {/* Fake mini chart */}
                      <motion.div 
                        initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: 1.2, duration: 1, type: 'spring' }}
                        className="h-28 w-full origin-bottom relative bg-black/20 rounded-xl overflow-hidden border border-white/5 p-2 backdrop-blur"
                      >
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockVideoData}>
                              <defs>
                                <linearGradient id="vidColor" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={types.find(t => t.id === activeType)?.color || '#00F0FF'} stopOpacity={1}/>
                                  <stop offset="95%" stopColor={types.find(t => t.id === activeType)?.color || '#00F0FF'} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="y" stroke={types.find(t => t.id === activeType)?.color || '#00F0FF'} fillOpacity={1} fill="url(#vidColor)" strokeWidth={4} />
                            </AreaChart>
                          </ResponsiveContainer>
                          {/* Live dot on chart */}
                          <div className="absolute right-2 top-4 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
                      </motion.div>
                    </div>

                    {/* Progress bar playing (like tiktok/reels) */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30 flex">
                        <motion.div 
                          className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(0,240,255,1)]"
                          initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
