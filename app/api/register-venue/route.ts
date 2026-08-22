import { NextResponse } from 'next/server';
import { saveVenueRegistration, getUserVenueRegistrations } from '@/lib/serverVenueStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { contactName, businessName, email, phone, venueType, bookingType, city, state, pincode } = body;

    if (!contactName || !businessName || !email || !phone || !venueType || !bookingType || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Please fill out all required fields.' }, { status: 400 });
    }

    const registration = saveVenueRegistration(body);

    return NextResponse.json({
      success: true,
      registration,
      message: 'Registration received. Thank you for your interest in TicketX. Our team will review your venue details and contact you.',
    });
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: 'Failed to process venue registration.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const email = searchParams.get('email') || undefined;

    const list = getUserVenueRegistrations(userId, email);
    return NextResponse.json({ registrations: list });
  } catch (err) {
    console.error('Fetch venue registrations error:', err);
    return NextResponse.json({ error: 'Failed to fetch venue registrations.' }, { status: 500 });
  }
}
