import { Booking } from '@/types/booking';

export async function downloadTicketPdf(booking: Booking, userName?: string): Promise<void> {
  const customerName = userName || 'TicketX Customer';
  const fileName = `TicketX_Pass_${booking.id}.html`;

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TicketX Digital Pass - ${booking.id}</title>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #ffffff;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .ticket-card {
      width: 380px;
      background: #121215;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.9);
    }
    /* Side Ticket Cutout Notches */
    .notch-left {
      position: absolute;
      top: 260px;
      left: -16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #09090b;
      border: 1px solid rgba(255,255,255,0.15);
      z-index: 10;
    }
    .notch-right {
      position: absolute;
      top: 260px;
      right: -16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #09090b;
      border: 1px solid rgba(255,255,255,0.15);
      z-index: 10;
    }
    .header {
      background: linear-gradient(90deg, rgba(225,29,72,0.2), rgba(0,0,0,0.8));
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #ffffff;
    }
    .brand span {
      color: #e11d48;
    }
    .badge {
      background: rgba(225, 29, 72, 0.2);
      color: #e11d48;
      border: 1px solid rgba(225, 29, 72, 0.4);
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .content {
      padding: 24px;
    }
    .movie-title {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .meta {
      font-size: 12px;
      color: #a1a1aa;
      margin-bottom: 16px;
    }
    .meta span {
      background: rgba(255,255,255,0.1);
      color: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-family: monospace;
    }
    .qr-box {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 16px;
      text-align: center;
      margin-bottom: 16px;
    }
    .qr-img {
      width: 140px;
      height: 140px;
      margin: 8px auto;
      background: white;
      padding: 8px;
      border-radius: 12px;
    }
    .qr-text {
      font-size: 10px;
      color: #9ca3af;
      font-family: monospace;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    .info-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 10px 12px;
      border-radius: 12px;
      font-family: monospace;
    }
    .info-label {
      font-size: 9px;
      color: #71717a;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
    }
    .seats-box {
      background: rgba(225, 29, 72, 0.1);
      border: 1px solid rgba(225, 29, 72, 0.25);
      padding: 10px 14px;
      border-radius: 12px;
      text-align: center;
      font-family: monospace;
    }
    .divider {
      border-bottom: 2px dashed rgba(255,255,255,0.2);
      margin: 4px 0;
    }
    .footer {
      padding: 16px 24px;
      background: rgba(0,0,0,0.5);
      font-size: 11px;
      color: #a1a1aa;
    }
    .footer-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.05);
      font-family: monospace;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="notch-left"></div>
    <div class="notch-right"></div>

    <div class="header">
      <div class="brand">TICKET<span>X</span></div>
      <div class="badge">CONFIRMED PASS</div>
    </div>

    <div class="content">
      <h1 class="movie-title">${booking.movieTitle}</h1>
      <div class="meta">
        <span>UA16+</span> Telugu • <strong style="color:#e11d48;">2D</strong>
      </div>
      
      <div style="font-size:12px; font-weight:700; color:#fbbf24; margin-bottom:16px;">
        📅 ${formattedDate} &nbsp;|&nbsp; ⏰ ${booking.time}
      </div>

      <div class="qr-box">
        <div style="font-size:11px; font-weight:700; color:#e2e8f0;">Scan QR Code at Theatre Entry</div>
        <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(booking.id)}" alt="QR Code" />
        <div class="qr-text">Booking ID: <strong style="color:#fff;">${booking.id}</strong></div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Screen</div>
          <div class="info-value">${booking.screen || 'SCREEN 1'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Customer</div>
          <div class="info-value">${customerName}</div>
        </div>
      </div>

      <div class="seats-box">
        <div class="info-label" style="color:#e11d48;">Confirmed Seats (${booking.seats.length})</div>
        <div style="font-size:14px; font-weight:900; color:#e11d48; letter-spacing:1px;">
          ${booking.seats.join(', ')}
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
      <div style="font-weight:700; color:#fff; font-size:12px;">📍 ${booking.theatre}</div>
      <div style="font-size:11px; color:#71717a;">Andhra Pradesh</div>
      <div class="footer-flex">
        <span>Total Paid: <strong style="color:#fff;">₹${booking.total}</strong></span>
        <span style="color:#e11d48; font-weight:800;">#TicketX</span>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }
}
