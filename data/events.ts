import { TicketXEvent } from '../types/event';

export const events: TicketXEvent[] = [
  {
    id: "nec-freshers",
    name: "NEC Freshers",
    title: "NEC Freshers",
    cityId: "nrt",
    cityName: "Narasaraopeta",
    venue: "NEC Campus Auditorium, Narasaraopet",
    date: "2026-09-15",
    time: "05:00 PM",
    eventType: "Freshers / College Event",
    poster: "/events/nec-freshers.jpg",
    image: "/events/nec-freshers.jpg",
    capacity: 1000,
    startingPrice: 10000,
    priceFrom: 10000,
    pricing: {
      silver: 10000,
      gold: 12999,
      premium: 15999,
    },
    bookingEnabled: true,
    description: "The grandest college freshers celebration featuring live music performances, DJ night, cultural showcases, and celebrity guest appearances at NEC Campus Auditorium.",
    organizer: "NEC Student Cultural Association",
  },
  {
    id: "starx-live",
    name: "StarX Live",
    title: "StarX Live",
    cityId: "hyderabad",
    cityName: "Hyderabad",
    venue: "Gachibowli Indoor Stadium, Hyderabad",
    date: "2026-09-20",
    time: "06:30 PM",
    eventType: "Live Event / Stage Event",
    poster: "/events/starx-live.jpg",
    image: "/events/starx-live.jpg",
    capacity: 1000,
    startingPrice: 2000,
    priceFrom: 2000,
    pricing: {
      silver: 2000,
      gold: 3499,
      premium: 4999,
    },
    bookingEnabled: true,
    description: "An extraordinary live concert and stage performance featuring top artists, high-energy laser light shows, and an immersive sound experience live at Gachibowli Stadium.",
    organizer: "StarX Live Entertainment",
  },
];

// Alias for backwards compatibility
export const mockEvents = events;
