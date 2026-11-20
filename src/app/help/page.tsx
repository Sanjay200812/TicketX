import Link from 'next/link';
import { Page } from '@/components/Page';

export const metadata = { title: 'Help & policies' };

const FAQ = [
  ['How do I enter the cinema with an M-Ticket?', 'Open the booking under Your bookings and show the QR code at the entrance. A screenshot works too. Printed tickets are not required.'],
  ['When does the seat hold expire?', 'Seats are held for 8 minutes from the moment you leave the seat map. If payment is not completed by then, the seats are released.'],
  ['Why is there a convenience fee?', 'A fee of ₹28 + 18% GST per ticket covers payment processing and the online booking service. Ticket prices already include GST.'],
  ['Can I change my seats after booking?', 'Seats can’t be changed. Cancel the booking (where the cinema allows) and book again.'],
  ['Is my food order cancelled with my tickets?', 'Yes. Food & beverages are refunded together with the tickets when a booking is cancelled.'],
  ['What ID do I need for an A-rated film?', 'Any government photo ID showing you are 18 or older. Entry may be refused without it, and the ticket is not refundable in that case.'],
];

export default function HelpPage() {
  return (
    <Page>
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Help & policies</h1>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-panel">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                  {q}
                  <span className="text-faint transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="cancellation" className="mt-12 scroll-mt-24">
          <h2 className="text-lg font-semibold">Cancellation & refunds</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>Bookings at participating cinemas can be cancelled up to 2 hours before the show starts.</li>
            <li>The ticket amount and any food & beverages are refunded. The convenience fee is non-refundable.</li>
            <li>Refunds reach the original payment method within 5–7 working days.</li>
            <li>Single-screen cinemas marked “Non-cancellable” don’t accept cancellations.</li>
          </ul>
        </section>

        <section id="contact" className="mt-12 scroll-mt-24">
          <h2 className="text-lg font-semibold">Contact support</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            For booking issues, keep your booking ID ready (it starts with TX). Support is available 9 AM – 11 PM, all days.
          </p>
          <Link href="/account" className="mt-4 inline-block text-sm font-medium text-marquee hover:underline">
            Go to your bookings →
          </Link>
        </section>
      </div>
    </Page>
  );
}
