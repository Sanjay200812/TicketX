import { NextResponse } from 'next/server';
import { recordCustomerLoginEvent } from '@/lib/serverUserStore';
import { recordLoginEvent } from '@/lib/serverActivityStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, name, phone, isNewUser, dob, gender, userAgent } = body;

    if (!uid || !phone) {
      return NextResponse.json({ error: 'Missing required parameters (uid, phone)' }, { status: 400 });
    }

    let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (/tablet|ipad/.test(ua)) {
        device = 'tablet';
      } else if (/mobile|android|iphone/.test(ua)) {
        device = 'mobile';
      }
    }

    const customer = await recordCustomerLoginEvent({
      uid,
      name: name || 'TicketX Customer',
      phone,
      isNewUser: Boolean(isNewUser),
      dob,
      gender,
    });

    await recordLoginEvent({
      uid,
      name: customer.name,
      phone: customer.phone,
      isNewUser: Boolean(isNewUser),
      device,
    });

    return NextResponse.json({ success: true, customer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record login event';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
