import { NextResponse } from 'next/server';
import { saveContactSubmission } from '@/lib/serverContactStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, category, booking_id, subject, message, user_id } = body;

    if (!name || !category || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields (Name, Category, Subject, Message).' },
        { status: 400 }
      );
    }

    const submission = saveContactSubmission({
      user_id: user_id || undefined,
      name,
      email: email || '',
      phone: phone || undefined,

      category,
      booking_id: booking_id || undefined,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. Thank you for contacting TicketX. Our support team has received your request.',
      data: submission,
    });
  } catch (error: unknown) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while submitting your message.' },
      { status: 500 }
    );
  }
}
