const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }

  return res.json();
}

// ─── Signals ─────────────────────────────────────
export async function getSignals(params?: { limit?: number; min_strength?: number; symbol?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.min_strength) query.set('min_strength', String(params.min_strength));
  if (params?.symbol) query.set('symbol', params.symbol);
  const qs = query.toString();
  return fetchAPI<{ signals: any[]; count: number }>(`/api/signals${qs ? `?${qs}` : ''}`);
}

export async function triggerScan() {
  return fetchAPI<{ message: string; status: string }>('/api/signals/scan', { method: 'POST' });
}

// ─── Patterns ────────────────────────────────────
export async function getPatterns(params?: { limit?: number; min_confidence?: number; symbol?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.min_confidence) query.set('min_confidence', String(params.min_confidence));
  if (params?.symbol) query.set('symbol', params.symbol);
  const qs = query.toString();
  return fetchAPI<{ patterns: any[]; count: number }>(`/api/patterns${qs ? `?${qs}` : ''}`);
}

export async function scanStockPattern(symbol: string) {
  return fetchAPI<any>(`/api/patterns/scan/${symbol}`);
}

// ─── Chat ────────────────────────────────────────
export async function sendChatMessage(message: string, conversationId?: string) {
  return fetchAPI<{
    text: string;
    citations: { id: number; source: string }[];
    conversation_id: string;
    timestamp: string;
  }>('/api/chat/', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });
}

// ─── Portfolio ───────────────────────────────────
export async function getPortfolio() {
  return fetchAPI<{ summary: any; holdings: any[] }>('/api/portfolio/');
}

export async function getStockQuote(symbol: string) {
  return fetchAPI<any>(`/api/portfolio/quote/${symbol}`);
}

export async function getStockNews(symbol: string) {
  return fetchAPI<{ symbol: string; articles: any[]; count: number }>(`/api/portfolio/news/${symbol}`);
}

// ─── Market Data ─────────────────────────────────
export async function getMarketHistory(symbolType: 'nifty' | 'sensex' = 'nifty') {
  return fetchAPI<{
    symbol: string;
    name: string;
    current_price: number;
    change: number;
    change_percent: number;
    data: { time: string; timestamp: string; price: number; volume: number }[];
  }>(`/api/market/history/${symbolType}`);
}

// ─── Reels ─────────────────────────────────────────
export async function generateReelContent(reelType: string) {
  return fetchAPI<any>('/api/reels/generate', {
    method: 'POST',
    body: JSON.stringify({ reel_type: reelType }),
  });
}

// ─── Health ──────────────────────────────────────
export async function checkHealth() {
  return fetchAPI<{ status: string; service: string }>('/health');
}

// ─── Collective Export (for VideoEngineView) ───────
export const ApiService = {
  getSignals,
  triggerScan,
  getPatterns,
  scanStockPattern,
  sendChatMessage,
  getPortfolio,
  getStockQuote,
  getStockNews,
  getMarketHistory,
  generateReelContent,
  checkHealth,
};
