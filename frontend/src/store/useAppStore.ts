import { create } from 'zustand';

// ─── Types ───────────────────────────────────────
export interface Signal {
  signal_id: string;
  timestamp: string;
  stock: {
    symbol: string;
    name: string;
    current_price: number;
    sector: string;
  };
  signal_type: string;
  strength: number;
  reasoning: string[];
  actionable_insight: string;
  risk_factors: string[];
  sources: string[];
}

export interface Pattern {
  id: string;
  symbol: string;
  pattern_type: string;
  confidence: number;
  detected_at: string;
  price_at_detection: number;
  support_level: number;
  resistance_level: number;
  target_price: number;
  stop_loss: number;
  historical_success_rate: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { id: number; source: string }[];
  timestamp: string;
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
}

// ─── Store ───────────────────────────────────────
interface AppState {
  // Navigation
  activeTab: 'dashboard' | 'signals' | 'patterns' | 'chat' | 'portfolio' | 'videoEngine';
  setActiveTab: (tab: AppState['activeTab']) => void;

  // Signals
  signals: Signal[];
  setSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;

  // Patterns
  patterns: Pattern[];
  setPatterns: (patterns: Pattern[]) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Market tickers
  tickers: MarketTicker[];
  setTickers: (tickers: MarketTicker[]) => void;

  // UI states
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  signals: [],
  setSignals: (signals) => set({ signals }),
  addSignal: (signal) => set((state) => ({ signals: [signal, ...state.signals] })),

  patterns: [],
  setPatterns: (patterns) => set({ patterns }),

  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  tickers: [],
  setTickers: (tickers) => set({ tickers }),

  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  selectedSymbol: null,
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
}));
