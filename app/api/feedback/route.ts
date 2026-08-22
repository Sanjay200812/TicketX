import { NextResponse } from 'next/server';
import { saveFeedback } from '@/lib/serverFeedbackStore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, rating, title, message } = body;

    if (!type || !rating || !title || !message) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }

    const record = saveFeedback({ userId, type, rating: Number(rating), title, message });

    return NextResponse.json({
      success: true,
      record,
      message: 'Thank you for your feedback.',
    });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: 'Failed to submit feedback.' }, { status: 500 });
  }
}
