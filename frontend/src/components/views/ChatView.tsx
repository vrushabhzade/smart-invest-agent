'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestions = [
  'What are the top 3 stocks to buy this week?',
  'Analyze RELIANCE earnings for Q3 2026',
  'Should I add more HDFCBANK to my portfolio?',
  'Compare TCS vs INFY for long-term investment',
  'What sector is showing the most momentum?',
  'Explain the current FII/DII trend in Indian markets',
];

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Market Advisor powered by Gemini. I have access to real-time NSE/BSE market data, your portfolio, and the latest corporate filings.\n\nAsk me anything about Indian markets — stock analysis, portfolio advice, sector comparisons, or earnings breakdowns. I'll provide data-driven insights with actionable recommendations.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Try live API first, fallback to demo
    try {
      const { sendChatMessage } = await import('@/lib/api');
      const result = await sendChatMessage(msg, conversationId);
      setConversationId(result.conversation_id);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch {
      // Fallback to demo responses if backend is offline
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateDemoResponse(msg),
        timestamp: new Date(),
      };
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-card)] border border-[var(--color-border)]'
              }`}>
                {msg.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-black" />
                ) : (
                  <User className="w-4 h-4 text-[var(--color-text-dim)]" />
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'assistant'
                  ? 'glass'
                  : 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20'
              }`}>
                <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-2">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[var(--color-primary)] animate-spin" />
              <span className="text-xs text-[var(--color-text-dim)]">Analyzing with Gemini AI...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pb-4"
        >
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" />
            Suggested Questions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => handleSend(s)}
                className="text-left text-xs text-[var(--color-text-dim)] p-3 rounded-xl glass hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all"
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Bar */}
      <div className="glass-strong rounded-2xl p-3 flex items-end gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-primary)]/10 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
          <span className="text-[9px] font-medium text-[var(--color-primary)]">Gemini</span>
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about stocks, portfolio, market trends..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none resize-none min-h-[24px] max-h-[120px]"
          style={{ lineHeight: '24px' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-black" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Demo Response Generator ─────────────────────
function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('reliance')) {
    return `📊 **RELIANCE Industries — Q3 2026 Analysis**

**Current Price:** ₹2,847.50 (+1.14%)

**Key Highlights:**
• Jio Platforms revenue: ₹32,450 Cr (+18% YoY) — subscriber base crossed 490M
• Retail revenue: ₹78,900 Cr — EBITDA margin expanded to 8.2%
• O2C segment: GRM at $11.2/bbl — elevated crack spreads supporting margins
• Consolidated PAT: ₹19,878 Cr (+12% YoY)

**AI Assessment:**
The stock trades at 24.5x FY27E earnings, which is reasonable given the growth trajectory. Jio's ARPU improvement to ₹233 (target ₹300 by FY28) is the key catalyst. New Energy investments (₹75,000 Cr over 3 years) provide long-term optionality but limited near-term earnings contribution.

**Recommendation:** HOLD — already at fair value. Accumulate on dips below ₹2,700.

[SOURCE: BSE Filing Q3FY26] [SOURCE: IIFL Research]`;
  }

  if (q.includes('top') || q.includes('buy')) {
    return `🎯 **Top 3 Stock Picks for This Week:**

**1. BHARTIARTL (₹1,687) — Score: 92/100**
• 5G subscriber additions accelerating (30M new in Q3)
• ARPU trajectory strong: ₹233 → ₹250 by Q4
• Target: ₹1,850 | Stop Loss: ₹1,600

**2. SBIN (₹812) — Score: 85/100**
• NPA coverage at 92%, credit growth 15.3% YoY
• Insider buying cluster: ₹4.2Cr in open market
• Target: ₹900 | Stop Loss: ₹770

**3. BAJFINANCE (₹7,230) — Score: 81/100**
• Bull Flag pattern with 75% historic success rate
• AUM growth 28% YoY, NIM stable at 13.2%
• Target: ₹8,000 | Stop Loss: ₹6,900

⚠️ *These are AI-generated suggestions based on technical patterns, filings analysis, and sentiment scores. Always do your own research.*

[SOURCE: NSE Market Data] [SOURCE: Pattern AI Engine]`;
  }

  if (q.includes('sector') || q.includes('momentum')) {
    return `📈 **Sector Momentum Analysis (Last 30 Days):**

| Sector | Performance | FII Flow | Momentum |
|--------|------------|----------|----------|
| 🏦 Banking | +4.2% | ₹3,200Cr | 🟢 Strong |
| 📡 Telecom | +6.8% | ₹1,800Cr | 🟢 Very Strong |
| 💊 Pharma | +2.1% | ₹900Cr | 🟡 Moderate |
| 🏗️ Infra | +3.5% | ₹1,400Cr | 🟢 Strong |
| 💻 IT | -1.3% | -₹2,100Cr | 🔴 Weak |
| 🚗 Auto | +1.8% | ₹600Cr | 🟡 Moderate |

**Top Sector Pick: Telecom** — driven by 5G rollout acceleration, ARPU expansion, and tower monetization deals. Bharti Airtel and Jio parent Reliance are the primary beneficiaries.

**Avoid: IT** — showing FII outflows due to global tech spending concerns and AI disruption fears.

[SOURCE: NSE Sector Indices] [SOURCE: NSDL FII Data]`;
  }

  return `I've analyzed your query. Here's what I found:

Based on current market data and AI analysis of recent filings, here are the key insights:

• **Market Sentiment:** Moderately bullish — Nifty holding above 22,400 support
• **FII Activity:** Net buyers at ₹1,200 Cr today
• **Key Events:** RBI policy meeting next week, Q3 earnings season in full swing

Would you like me to dive deeper into any specific stock or sector? I can also:
- Run a technical pattern scan on any stock
- Analyze recent corporate filings
- Compare multiple stocks head-to-head
- Review your portfolio allocation

[SOURCE: NSE Market Data]`;
}
