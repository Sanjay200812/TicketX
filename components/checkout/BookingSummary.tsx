import { Movie } from '@/types/movie';
import { Theatre } from '@/types/theatre';
import { Show } from '@/types/show';
import { Seat } from '@/types/seat';
import {
  calculateSubtotal,
  calculateBookingFee,
  calculateTax,
  calculateTotal,
  BOOKING_FEE_PER_TICKET,
  TAX_RATE,
} from '@/lib/pricing';
import { MoviePoster } from '@/components/shared/MoviePoster';

interface BookingSummaryProps {
  movie: Movie;
  theatre: Theatre;
  show: Show;
  selectedSeats: Seat[];
  isEvent?: boolean;
}

export function BookingSummary({ movie, theatre, show, selectedSeats, isEvent = false }: BookingSummaryProps) {
  const subtotal = calculateSubtotal(selectedSeats);
  const bookingFee = calculateBookingFee(selectedSeats);
  const tax = calculateTax(selectedSeats);
  const total = calculateTotal(selectedSeats);

  // Group categories for clear display (Requirement 7, 27, 28)
  const categoryGroups = selectedSeats.reduce((acc, s) => {
    let catName = s.category || 'General';
    if (isEvent && catName.toLowerCase().includes('gold') && !catName.toLowerCase().includes('balcony')) {
      catName = 'Gold (Balcony)';
    }
    if (!acc[catName]) {
      acc[catName] = { count: 0, price: s.price };
    }
    acc[catName].count += 1;
    return acc;
  }, {} as Record<string, { count: number; price: number }>);

  return (
    <div className="bg-secondary/40 border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
        <h2 className="text-xl font-bold font-heading text-white">Order Summary</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          TICKETX CHECKOUT
        </span>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <MoviePoster src={movie.poster} title={movie.title} className="w-full h-full" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{movie.title}</h3>
            <p className="text-muted-foreground text-sm">
              {movie.language} • {show.format || '2D'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-black/40 p-4 rounded-xl border border-white/5 font-mono">
          <div>
            <p className="text-muted-foreground mb-1">Venue / Cinema</p>
            <p className="font-semibold text-white">{theatre.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Screen / Hall</p>
            <p className="font-semibold text-white">{show.screenName || show.screen || 'Screen 1'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Date</p>
            <p className="font-semibold text-white">
              {new Date(show.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Time</p>
            <p className="font-semibold text-white">{show.time}</p>
          </div>
        </div>

        {/* Selected Seats & Categories */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-semibold">Selected Seats ({selectedSeats.length})</span>
            <span className="font-bold text-white font-mono max-w-[60%] text-right truncate">
              {selectedSeats.map((s) => s.id).join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs pt-1">
            {Object.entries(categoryGroups).map(([cat, data]) => (
              <span key={cat} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-300 font-mono">
                <span className="font-bold text-white">{cat}</span>: {data.count} × ₹{data.price.toLocaleString()}
              </span>
            ))}
          </div>
        </div>

        {/* Itemized Taxes & Fees */}
        <div className="border-t border-dashed border-white/20 pt-6 space-y-3 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ticket Subtotal</span>
            <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Booking Fee (₹{BOOKING_FEE_PER_TICKET} × {selectedSeats.length})
            </span>
            <span className="text-white font-bold">₹{bookingFee.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">GST Tax ({TAX_RATE * 100}%)</span>
            <span className="text-white font-bold">₹{tax.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-base font-bold text-white">Grand Total</span>
          <span className="text-2xl font-extrabold text-primary font-mono">₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
