"use client";

import Link from 'next/link';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export function Footer() {
  const { isDesktopExpanded } = useSidebar();

  return (
    <footer
      className={cn(
        'bg-[#080808] border-t border-white/5 py-12 md:py-16 transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        isDesktopExpanded ? 'lg:pl-[260px]' : 'lg:pl-[68px]'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tighter text-white font-heading">
                Ticket<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
              Your Seat. Your Show. Your TicketX. Movies &amp; events begin before the screen lights up.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/movies" className="hover:text-primary transition-colors">Movies</Link></li>
              <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
              <li><Link href="/theatres" className="hover:text-primary transition-colors">Theatres</Link></li>
              <li><Link href="/favorites" className="hover:text-primary transition-colors">Saved Movies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Help &amp; Support</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/support" className="hover:text-primary transition-colors">Support Hub</Link></li>
              <li><Link href="/support/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/support/feedback" className="hover:text-primary transition-colors">Send Feedback</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">Settings &amp; Theme</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Partners &amp; Venue Owners</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/partners" className="text-amber-400 hover:underline transition-colors font-bold">Partner with TicketX</Link></li>
              <li><Link href="/partners/register-venue" className="hover:text-primary transition-colors">Register Your Hall</Link></li>

            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TicketX. All rights reserved.</p>
          <p className="font-mono text-[11px]">Andhra Pradesh • Narasaraopeta • Guntur • Vijayawada</p>
        </div>
      </div>
    </footer>
  );
}
