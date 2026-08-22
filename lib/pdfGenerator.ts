import { Booking } from '@/types/booking';

export async function downloadTicketPdf(booking: Booking, userName?: string): Promise<void> {
  const customerName = userName || 'TicketX Customer';
  const fileName = `TicketX_Pass_${booking.id}.html`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TicketX Booking Pass - ${booking.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #09090b;
      color: #ffffff;
      padding: 30px;
      display: flex;
      justify-content: center;
    }
    .ticket-card {
      width: 400px;
      background: #141417;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .header {
      background: rgba(225, 29, 72, 0.15);
      border-bottom: 1px solid rgba(225, 29, 72, 0.3);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      color: #e11d48;
      font-weight: 900;
      letter-spacing: 3px;
      font-size: 16px;
    }
    .status-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .venue {
      color: #a1a1aa;
      font-size: 13px;
      margin: 0 0 16px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px 0;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
    }
    .label {
      color: #71717a;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .value {
      font-size: 13px;
      font-weight: 700;
      color: #f4f4f5;
    }
    .price-box {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.03);
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .grand-total {
      color: #e11d48;
      font-size: 18px;
      font-weight: 900;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 11px;
      color: #71717a;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div class="brand">TICKETX</div>
      <div class="status-badge">BOOKING CONFIRMED</div>
    </div>
    <div class="content">
      <h1 class="title">${booking.movieTitle}</h1>
      <p class="venue">${booking.theatre} • ${booking.screen}</p>
      
      <div class="grid">
        <div>
          <div class="label">Date</div>
          <div class="value">${new Date(booking.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
        <div>
          <div class="label">Showtime</div>
          <div class="value">${booking.time}</div>
        </div>
        <div>
          <div class="label">Seats (${booking.seats.length})</div>
          <div class="value">${booking.seats.join(', ')}</div>
        </div>
        <div>
          <div class="label">Booked By</div>
          <div class="value">${customerName}</div>
        </div>
      </div>

      <div class="price-box">
        <div class="label" style="margin:0;">Total Paid</div>
        <div class="grand-total">₹${booking.total}</div>
      </div>
    </div>
    <div class="footer">
      Booking Reference ID: <strong style="color:#fff;">${booking.id}</strong><br>
      Please show this ticket pass at the venue entrance.
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
