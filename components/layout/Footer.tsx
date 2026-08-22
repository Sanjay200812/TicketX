import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tighter text-white">
                Ticket<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your Seat. Your Show. Your TicketX. Movies begin before the screen lights up.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/movies" className="hover:text-primary transition-colors">Movies</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Theatres</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Offers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/my-bookings" className="hover:text-primary transition-colors">My Bookings</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Profile</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TicketX Prototype. All rights reserved.</p>
          <p>Designed for Cinematic Excellence</p>
        </div>
      </div>
    </footer>
  );
}
