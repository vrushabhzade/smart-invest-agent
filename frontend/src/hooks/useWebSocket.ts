'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMarketUpdate?: (tickers: MarketTick[]) => void;
  reconnectInterval?: number;
}

export function useWebSocket({
  url = 'ws://127.0.0.1:8000/ws/market',
  onMarketUpdate,
  reconnectInterval = 3000,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('📡 WebSocket connected');
        setIsConnected(true);

        // Subscribe to all stocks
        ws.send(JSON.stringify({
          type: 'subscribe',
          symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC'],
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'market_update' && onMarketUpdate) {
            onMarketUpdate(msg.data);
            setLastUpdate(msg.timestamp);
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('📡 WebSocket disconnected, reconnecting...');
        setIsConnected(false);

        // Auto-reconnect
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      // Server not available
      console.log('WebSocket server not available, using demo mode');
      reconnectTimerRef.current = setTimeout(connect, reconnectInterval * 2);
    }
  }, [url, onMarketUpdate, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, lastUpdate, send };
}
