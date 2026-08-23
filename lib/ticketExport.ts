import { toJpeg } from 'html-to-image';
import { Booking } from '@/types/booking';

export async function generateTicketJpgBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#121215',
    });

    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (err) {
    console.error('Error generating ticket JPEG:', err);
    return null;
  }
}

export async function downloadTicketJpg(booking: Booking, elementId: string = 'ticket-card-pass'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Ticket element not found for download');
    return false;
  }

  const blob = await generateTicketJpgBlob(element);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TicketX_${booking.id || 'TX-PASS'}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export async function shareTicketJpg(
  booking: Booking,
  elementId: string = 'ticket-card-pass'
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'download' }> {
  const formattedText = `🎟️ TicketX Booking Pass
Movie: ${booking.movieTitle}
Theatre: ${booking.theatre}
Date: ${booking.date} • ${booking.time}
Seats: ${booking.seats.join(', ')}
Booking ID: ${booking.id}`;

  const element = document.getElementById(elementId);
  if (element) {
    const blob = await generateTicketJpgBlob(element);
    if (blob) {
      const file = new File([blob], `TicketX_${booking.id}.jpg`, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `TicketX Pass - ${booking.movieTitle}`,
            text: formattedText,
            files: [file],
          });
          return { success: true, method: 'native' };
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') return { success: false, method: 'native' };
        }
      }
    }
  }

  // Fallback if navigator.share with files is not supported
  try {
    await navigator.clipboard.writeText(formattedText);
    return { success: true, method: 'clipboard' };
  } catch {
    // If clipboard fails, download JPG directly
    await downloadTicketJpg(booking, elementId);
    return { success: true, method: 'download' };
  }
}
