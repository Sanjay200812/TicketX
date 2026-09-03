"use client";

import Link from 'next/link';
import { Store, Building2, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PartnersPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-4 shadow-xl">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-3">Partner with TicketX</h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            List your movie theatre, auditorium, event hall or multipurpose venue on TicketX to reach active audience members across Andhra Pradesh.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-secondary/40 border border-white/10 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Cinema &amp; Multiplexes</h3>
            <p className="text-xs text-gray-400">
              Complete real-time seating configuration with Gold, Silver, and NRT On Land Luxury recliner support.
            </p>
          </div>

          <div className="bg-secondary/40 border border-white/10 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Auditoriums &amp; Halls</h3>
            <p className="text-xs text-gray-400">
              Host college events like NEC Freshers or StarX live shows with digital ticket QR code validation.
            </p>
          </div>

          <div className="bg-secondary/40 border border-white/10 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Dedicated Onboarding</h3>
            <p className="text-xs text-gray-400">
              Upload your seating map diagram and our technical team will digitize your exact screen layout.
            </p>
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-secondary/60 to-primary/20 border border-amber-500/30 p-8 md:p-10 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">Ready to List Your Property?</h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-md mx-auto">
              Submit your venue registration details to receive a callback from our partnership team.
            </p>
          </div>

          <Link href="/partners/register-venue" className="inline-block">
            <Button className="h-14 px-8 rounded-2xl font-extrabold text-base bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center gap-2">
              <span>REGISTER YOUR HALL</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
