import { NextRequest, NextResponse } from 'next/server';
import { movies } from '@/data/movies';
import { theatres } from '@/data/theatres';
import { locations } from '@/data/locations';
import { shows } from '@/data/shows';
import { events } from '@/data/events';
import { seatLayoutsList } from '@/data/seatLayouts';

interface UserBookingContext {
  id: string;
  movieTitle: string;
  theatre: string;
  date: string;
  time: string;
  seats: string[];
  archived?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { message, userBookings } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const contextData = {
      systemRole: "You are TicketX Assistant, the official AI assistant for TicketX cinema and event ticketing app.",
      rules: [
        "Use ONLY the provided TicketX data as ground truth.",
        "If asked about movies, showtimes, theatres, prices, or locations, answer using the exact supplied data.",
        "If requested information is missing from the data, explicitly respond: 'That information isn't available in TicketX yet.' Do NOT invent or hallucinate cinema data.",
        "Help users with app questions like how to archive/unarchive bookings, download JPEG pass, reset password, or change profile photo.",
        "Keep answers helpful, concise, friendly, and formatted nicely.",
      ],
      currentMovies: movies.map((m) => ({
        title: m.title,
        language: m.language,
        genres: m.genres,
        rating: m.rating,
        duration: m.duration,
        certificate: m.certificate,
        cast: m.cast?.map((c) => c.name),
        crew: m.crew?.map((c) => `${c.role}: ${c.name}`),
      })),
      locations: locations.map((l) => ({ id: l.id, name: l.name, state: l.state })),
      theatres: theatres.map((t) => ({
        id: t.id,
        name: t.name,
        locationId: t.locationId,
        area: t.area,
        facilities: t.facilities,
      })),
      seatPricingExamples: seatLayoutsList.map((sl) => ({
        theatre: sl.theatreName,
        sections: sl.sections.map((s) => ({ name: s.name, price: s.price })),
      })),
      eventsList: events.map((e) => ({ title: e.title, location: `${e.venue}, ${e.cityName}`, date: e.date, price: e.startingPrice })),
      currentUserBookings: Array.isArray(userBookings)
        ? (userBookings as UserBookingContext[]).map((b) => ({
            id: b.id,
            movieTitle: b.movieTitle,
            theatre: b.theatre,
            date: b.date,
            time: b.time,
            seats: b.seats,
            archived: Boolean(b.archived),
          }))
        : [],
    };

    const prompt = `System Context:
${JSON.stringify(contextData, null, 2)}

User Question: ${message}

Provide a direct, helpful response based strictly on TicketX context.`;

    if (!apiKey) {
      const msgLower = message.toLowerCase();
      let responseText = "TicketX Assistant: ";

      if (msgLower.includes('guntur') && (msgLower.includes('movie') || msgLower.includes('theatre'))) {
        const gunturTheatres = theatres.filter((t) => t.locationId === 'guntur').map((t) => t.name).join(', ');
        responseText += `Theatres showing movies in Guntur include: ${gunturTheatres}.`;
      } else if (msgLower.includes('irumudi')) {
        const irumudiShows = shows.filter((s) => s.movieId === 'irumudi');
        const theatreIds = Array.from(new Set(irumudiShows.map((s) => s.theatreId)));
        const tNames = theatres.filter((t) => theatreIds.includes(t.id)).map((t) => t.name).join(' and ');
        responseText += `Irumudi is playing in Guntur at: ${tNames || 'Mythri Cinemas, Plateno Cinemas, and Sri Saraswathi Picture Palace'}.`;
      } else if (msgLower.includes('booking') || msgLower.includes('my booking')) {
        if (contextData.currentUserBookings.length > 0) {
          const list = contextData.currentUserBookings.map((b) => `${b.movieTitle} at ${b.theatre} on ${b.date} (${b.seats.join(', ')})`).join('; ');
          responseText += `Here are your current bookings: ${list}.`;
        } else {
          responseText += "You don't have any active bookings right now. You can browse movies or events to book passes!";
        }
      } else if (msgLower.includes('archive')) {
        responseText += "To archive a booking, go to My Bookings → click the Archive icon on any booking card. The booking moves to your Archived tab. You can click Unarchive anytime to restore it!";
      } else if (msgLower.includes('password') || msgLower.includes('reset')) {
        responseText += "To reset your password, go to Sign In page → click 'Forgot Password?' → enter your email to receive a password reset link.";
      } else if (msgLower.includes('download') || msgLower.includes('jpg')) {
        responseText += "To download your digital pass as a high-quality JPG image, go to My Bookings → click 'Download JPG' on your pass card or view pass modal.";
      } else if (msgLower.includes('price') || msgLower.includes('recliner') || msgLower.includes('gold')) {
        responseText += "TicketX seat prices are theatre-specific. For example, Plateno Cinemas: Recliner ₹295, Elite ₹177; Pallavi Keerthana: Recliner ₹200, Sofa ₹150; Saraswathi: Gold ₹105; Mythri: Gold ₹150, Silver ₹150.";
      } else {
        responseText += "I am here to help you with movie showtimes, theatre availability, seat prices, booking passes, and profile support!";
      }

      return NextResponse.json({ text: responseText });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.text();
      console.error('Gemini API error:', errData);
      return NextResponse.json({ text: 'TicketX Assistant is temporarily busy. Please ask again in a moment.' });
    }

    const result = await geminiRes.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "That information isn't available in TicketX yet.";

    return NextResponse.json({ text: generatedText });
  } catch (err: unknown) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { text: 'TicketX Assistant is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
