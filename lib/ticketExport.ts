import { Booking } from '@/types/booking';
import QRCode from 'qrcode';

/**
 * High-DPI Canvas 2D Ticket Exporter for TicketX.
 * Renders an ultra-crisp, non-blank TicketX digital ticket pass
 * with complete poster, QR code, show details, seat pills, and branding.
 */
export async function generateTicketCanvasBlob(booking: Booking): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1360;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Base Dark Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#101014');
    bgGradient.addColorStop(0.5, '#15151b');
    bgGradient.addColorStop(1, '#0c0c0f');

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 40);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Top Header Brand Bar
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, 'rgba(216, 33, 50, 0.35)');
    headerGradient.addColorStop(0.5, 'rgba(150, 20, 35, 0.2)');
    headerGradient.addColorStop(1, '#101014');

    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 120);

    // Header divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(width, 120);
    ctx.stroke();

    // Brand Name: TICKETX
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.fillText('TICKET', 48, 76);

    ctx.fillStyle = '#D82132';
    ctx.fillText('X', 48 + ctx.measureText('TICKET').width, 76);

    // Digital Pass Badge
    const badgeText = 'DIGITAL PASS';
    ctx.font = 'bold 16px monospace';
    const badgeWidth = ctx.measureText(badgeText).width + 24;

    ctx.fillStyle = 'rgba(216, 33, 50, 0.25)';
    ctx.beginPath();
    ctx.roundRect(width - 48 - badgeWidth, 52, badgeWidth, 34, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(216, 33, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ff4d5e';
    ctx.fillText(badgeText, width - 48 - badgeWidth + 12, 75);

    // 3. Movie Title & Meta
    const movieTitle = booking.movieTitle || 'Movie Ticket';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px "Space Grotesk", sans-serif';

    // Truncate title if too long
    let displayTitle = movieTitle;
    if (ctx.measureText(displayTitle).width > 700) {
      while (ctx.measureText(displayTitle + '...').width > 700 && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '...';
    }
    ctx.fillText(displayTitle, 48, 185);

    // Meta Badges (Format, Cert, Lang)
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(48, 205, 76, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('UA16+', 60, 225);

    const langText = booking.movieLanguage || 'Telugu';
    ctx.font = 'bold 16px monospace';
    const langWidth = ctx.measureText(langText).width + 24;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(134, 205, langWidth, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(langText, 146, 225);

    ctx.fillStyle = 'rgba(216, 33, 50, 0.25)';
    ctx.beginPath();
    ctx.roundRect(134 + langWidth + 10, 205, 54, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ff4d5e';
    ctx.fillText('2D', 134 + langWidth + 24, 225);

    // Date & Showtime
    const dateFormatted = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText(`📅 ${dateFormatted}   •   ⏰ ${booking.time}`, 48, 275);

    // 4. QR Code Box (Center)
    const qrSize = 340;
    const qrX = (width - qrSize) / 2;
    const qrY = 320;

    // QR Box container
    ctx.fillStyle = '#08080a';
    ctx.beginPath();
    ctx.roundRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 110, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Generate real QR code image
    const qrPayload = JSON.stringify({
      id: booking.id,
      movie: booking.movieTitle,
      theatre: booking.theatre,
      date: booking.date,
      time: booking.time,
      seats: booking.seats.join(','),
      total: booking.total,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      // Draw white backing
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 16);
      ctx.fill();

      // Draw QR Code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // Fallback if QR generation fails
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
    }

    // Booking ID label under QR
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN QR CODE AT CINEMA ENTRY', width / 2, qrY + qrSize + 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`BOOKING ID: ${booking.id || 'TX-PASS'}`, width / 2, qrY + qrSize + 66);
    ctx.textAlign = 'left';

    // 5. Screen, Category & Seats Information Grid
    const gridY = 810;

    // Screen Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(48, gridY, 340, 95, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('AUDITORIUM / SCREEN', 68, gridY + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText(booking.screen || 'SCREEN 1', 68, gridY + 70);

    // Category Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(412, gridY, 340, 95, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SEATING CATEGORY', 432, gridY + 34);

    ctx.fillStyle = '#10b981';
    ctx.font = '900 24px "Space Grotesk", sans-serif';
    ctx.fillText('GOLD ₹295', 432, gridY + 70);

    // Confirmed Seats Box (Full Width)
    const seatsY = 930;
    ctx.fillStyle = 'rgba(216, 33, 50, 0.15)';
    ctx.beginPath();
    ctx.roundRect(48, seatsY, 704, 100, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(216, 33, 50, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`CONFIRMED SEATS (${booking.seats.length})`, 68, seatsY + 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px monospace';
    ctx.fillText(booking.seats.join('   '), 68, seatsY + 76);

    // 6. Perforated Dashed Divider Line & Side Notches
    const notchY = 1070;

    // Left circular notch
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, notchY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right circular notch
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(width, notchY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dashed line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(35, notchY);
    ctx.lineTo(width - 35, notchY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 7. Venue & Payment Footer Section
    const footerY = 1120;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(48, footerY, 704, 180, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Theatre Pin & Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText(`📍 ${booking.theatre || 'Cinema Hall'}`, 72, footerY + 48);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillText('Andhra Pradesh • TicketX Verified Venue', 106, footerY + 80);

    // Divider in footer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(72, footerY + 110);
    ctx.lineTo(width - 72, footerY + 110);
    ctx.stroke();

    // Total Paid & Hashtag
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px monospace';
    ctx.fillText('TOTAL PAID:', 72, footerY + 150);

    ctx.fillStyle = '#10b981';
    ctx.font = '900 22px monospace';
    ctx.fillText(`₹${booking.total ? booking.total.toLocaleString() : '---'}`, 190, footerY + 150);

    ctx.fillStyle = '#D82132';
    ctx.font = '900 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('#TicketX Experience', width - 72, footerY + 150);
    ctx.textAlign = 'left';

    // 8. Convert to JPEG Blob
    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 5000) {
            resolve(blob);
          } else {
            console.error('Generated canvas ticket blob was too small:', blob?.size);
            resolve(null);
          }
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (err) {
    console.error('Error generating canvas ticket:', err);
    return null;
  }
}

/**
 * Downloads the confirmed ticket pass as a crisp JPEG file.
 */
export async function downloadTicketJpg(
  booking: Booking
): Promise<boolean> {
  try {
    const blob = await generateTicketCanvasBlob(booking);
    if (!blob) {
      console.error('Failed to generate valid ticket image blob');
      return false;
    }

    const url = URL.createObjectURL(blob);
    const sanitizedTitle = (booking.movieTitle || 'Movie').replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedId = (booking.id || 'TX-PASS').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `TicketX_${sanitizedTitle}_${sanitizedId}.jpg`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);

    return true;
  } catch (err) {
    console.error('Failed to download ticket:', err);
    return false;
  }
}

/**
 * Shares or downloads the confirmed ticket.
 */
export async function shareTicketJpg(
  booking: Booking
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'download' }> {
  const formattedText = `🎟️ TicketX Booking Pass
Movie: ${booking.movieTitle}
Theatre: ${booking.theatre}
Date: ${booking.date} • ${booking.time}
Seats: ${booking.seats.join(', ')}
Booking ID: ${booking.id}`;

  try {
    const blob = await generateTicketCanvasBlob(booking);
    if (blob) {
      const file = new File([blob], `TicketX_${booking.id}.jpg`, { type: 'image/jpeg' });

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
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
  } catch (err) {
    console.warn('Share file attempt failed, falling back:', err);
  }

  // Fallback to clipboard or download
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(formattedText);
      return { success: true, method: 'clipboard' };
    } catch {
      await downloadTicketJpg(booking);
      return { success: true, method: 'download' };
    }
  }

  await downloadTicketJpg(booking);
  return { success: true, method: 'download' };
}
