import { Booking } from '@/types/booking';

export async function shareTicket(booking: Booking): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const shareText = `🎬 TicketX Booking Pass for ${booking.movieTitle}!\n📍 Venue: ${booking.theatre}\n📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} at ${booking.time}\n🎟️ Seats: ${booking.seats.join(', ')}\n🆔 Booking ID: ${booking.id}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `TicketX - ${booking.movieTitle}`,
        text: shareText,
        url: window.location.origin + '/my-bookings',
      });
      return { success: true, method: 'native' };
    } catch (err) {
      // User cancelled share or device doesn't support Web Share API
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'native' };
      }
    }
  }

  // Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }

  return { success: false, method: 'clipboard' };
}
