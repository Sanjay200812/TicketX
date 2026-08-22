"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'Booking' | 'Seats' | 'Payments' | 'Tickets' | 'Account';
}

const FAQS: FAQItem[] = [
  {
    category: 'Booking',
    question: 'How many seats can I book at once on TicketX?',
    answer: 'You can select and book a maximum of 10 seats per transaction to ensure fair availability for all cinema lovers.',
  },
  {
    category: 'Seats',
    question: 'How long are selected seats held during checkout?',
    answer: 'Once you select your seats, they are held in real-time for 10 minutes to complete your UPI or payment transaction. If you abandon the process, held seats auto-release after 5 minutes.',
  },
  {
    category: 'Payments',
    question: 'How are TicketX booking charges calculated?',
    answer: 'Booking charges are structured on a per-ticket basis: ₹20 base booking charge per ticket plus 18% IGST (₹3.60), resulting in a total booking fee of ₹23.60 per ticket.',
  },
  {
    category: 'Seats',
    question: 'What seat categories exist in Narasaraopeta (NRT) vs other cities?',
    answer: 'Narasaraopeta (NRT) theatres feature GOLD (₹295), SILVER (₹150), and ON LAND LUXURY (₹1,116). All other non-NRT theatres (Guntur, Vijayawada, etc.) strictly feature GOLD (₹295) and SILVER (₹150).',
  },
  {
    category: 'Tickets',
    question: 'Where can I view or download my booked ticket pass?',
    answer: 'Navigate to your Profile Account menu → My Bookings. Click on your active ticket pass to view details, download the image pass, or share your digital QR code.',
  },
  {
    category: 'Account',
    question: 'How do I change the TicketX theme between Light, Dark, or Device Default?',
    answer: 'Go to Settings (via Account Menu or Sidebar) → Appearance. Choose between Light, Dark, or Device Default. Device Default automatically syncs with your OS/browser prefers-color-scheme in real-time.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-4 shadow-lg">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Everything you need to know about TicketX seat reservations, booking fees, and pass downloads.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="bg-secondary/30 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm md:text-base text-white hover:text-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs md:text-sm text-gray-300 border-t border-white/5 pt-3 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
