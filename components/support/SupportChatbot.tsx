"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_CHIPS = [
  'Booking Help',
  'Payment & Fees',
  'Seat Hold Timer',
  'Download Ticket',
  'Login / OTP',
];

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! Welcome to TicketX Support. How can I assist you with your movie, show, or theatre booking today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate smart Bot response based on TicketX system rules
    setTimeout(() => {
      let botResponse = 'Thank you for reaching out. For further assistance, feel free to submit feedback or check our FAQ page.';
      const qLower = query.toLowerCase();

      if (qLower.includes('booking') || qLower.includes('book') || qLower.includes('ticket')) {
        botResponse = 'You can book up to 10 seats per booking on TicketX. Once selected, your seats are reserved for 10 minutes to complete payment.';
      } else if (qLower.includes('fee') || qLower.includes('charge') || qLower.includes('price') || qLower.includes('igst')) {
        botResponse = 'TicketX booking charges are calculated per ticket: ₹20 base booking charge per ticket + 18% IGST (₹3.60), totaling ₹23.60 per ticket.';
      } else if (qLower.includes('timer') || qLower.includes('hold') || qLower.includes('expire')) {
        botResponse = 'Selected seats are held in real-time for 10 minutes during active checkout. If checkout is closed without payment, held seats auto-release after 5 minutes.';
      } else if (qLower.includes('download') || qLower.includes('share') || qLower.includes('pass')) {
        botResponse = 'To view or download your ticket pass, click your account menu → My Bookings → select your pass to download or share QR code.';
      } else if (qLower.includes('login') || qLower.includes('otp') || qLower.includes('google')) {
        botResponse = 'You can log in via Google OAuth or 6-digit Phone OTP. Enter your 10-digit mobile number to receive your instant verification code.';
      } else if (qLower.includes('theatre') || qLower.includes('nrt') || qLower.includes('category')) {
        botResponse = 'Narasaraopeta (NRT) theatres feature Gold (₹295), Silver (₹150), and On Land Luxury (₹1,116). Non-NRT theatres feature Gold (₹295) and Silver (₹150).';
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-[0_0_25px_rgba(216,33,50,0.5)] hover:scale-105 transition-all flex items-center justify-center border-2 border-white/20"
          aria-label="Open TicketX Support Chat"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm h-[480px] bg-[#141418] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    TicketX Support <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online Assistant
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-black/50 border border-white/10 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-3 py-2 bg-black/30 border-t border-white/10 flex gap-1.5 overflow-x-auto hide-scrollbar">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-semibold text-gray-300 shrink-0 transition-all flex items-center gap-1"
                >
                  <span>{chip}</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2"
            >
              <Input
                placeholder="Ask support a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-black/50 border-white/10 text-xs text-white rounded-xl focus:border-primary"
              />
              <Button type="submit" size="icon" className="rounded-xl w-9 h-9 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
