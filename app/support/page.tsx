"use client";

import Link from 'next/link';
import { HelpCircle, FileQuestion, MessageSquare, Ticket, CreditCard, ShieldCheck, MapPin, Store, ChevronRight } from 'lucide-react';

export default function SupportHubPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-4 shadow-lg">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">TicketX Help &amp; Support</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Need help with your ticket booking, seat reservation, or theatre enquiries? We are here 24/7.
          </p>
        </div>

        {/* Support Grid Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/support/faq"
            className="bg-secondary/40 border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 transition-all group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions (FAQ)
                </h3>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Find quick answers regarding max 10 seat limits, seat holds, ₹20/ticket + 18% IGST booking fees, and pass downloads.
              </p>
            </div>
          </Link>

          <Link
            href="/support/feedback"
            className="bg-secondary/40 border border-white/10 hover:border-rose-500/40 rounded-3xl p-6 transition-all group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white group-hover:text-rose-400 transition-colors">
                  Send Feedback &amp; Suggestions
                </h3>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Share your experience, report bugs, or request features directly to our product team.
              </p>
            </div>
          </Link>
        </div>

        {/* Popular Topic Categories */}
        <div className="bg-secondary/30 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold font-heading text-white border-b border-white/10 pb-3">
            Common Support Topics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
            <Link href="/support/faq" className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 flex items-center gap-3">
              <Ticket className="w-4 h-4 text-primary" />
              <span>Ticket Pass &amp; QR Download</span>
            </Link>

            <Link href="/support/faq" className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>UPI Payments &amp; Charges</span>
            </Link>

            <Link href="/support/faq" className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>10-Min Seat Hold Timer</span>
            </Link>

            <Link href="/support/faq" className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location &amp; Cities</span>
            </Link>

            <Link href="/partners" className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-white/20 text-gray-200 flex items-center gap-3">
              <Store className="w-4 h-4 text-cyan-400" />
              <span>Partner with TicketX</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
