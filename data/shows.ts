import { TicketXShow } from '@/types/show';

export function createShows({
  locationId,
  theatreId,
  movieId,
  date,
  times,
  screenName,
  priceOverrides,
}: {
  locationId: string;
  theatreId: string;
  movieId: string;
  date: string;
  times: string[];
  screenName?: string;
  priceOverrides?: { premium?: number; gold?: number; onLand?: number };
}): TicketXShow[] {
  const seatLayoutId = `layout-${theatreId}`;
  return times.map((time, index) => ({
    id: `${locationId}-${theatreId}-${movieId}-${date}-${index}`,
    locationId,
    theatreId,
    movieId,
    date,
    time,
    screenName,
    seatLayoutId,
    priceOverrides,
  }));
}

const GUNTUR_DATE = "2026-08-22";
const SUNDAY_DATE = "2026-08-23";

export const shows: TicketXShow[] = [
  // ==========================================
  // 1. GUNTUR SHOWS
  // ==========================================
  ...createShows({
    locationId: "guntur",
    theatreId: "plateno-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:15 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "plateno-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:15 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "pallavi-keerthana-complex",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:40 PM", "06:15 PM", "09:40 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "pallavi-keerthana-complex",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:20 PM", "09:45 PM"],
    screenName: "Keerthana Screen"
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "sri-saraswathi-picture-palace",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:30 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["01:40 PM", "04:30 PM", "07:40 PM", "10:40 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["01:10 PM", "04:10 PM", "07:15 PM", "10:15 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["01:40 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    movieId: "paw-patrol-the-dino-movie",
    date: GUNTUR_DATE,
    times: ["02:20 PM", "06:50 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "cine-prime-cinema",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "06:45 PM", "10:00 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "cine-prime-cinema",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "06:45 PM", "10:00 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "bhaskar-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "cine-square",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["06:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "cine-square",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["01:00 PM", "04:00 PM", "07:25 PM", "10:25 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    movieId: "debba-debba",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "10:00 PM"],
    priceOverrides: { premium: 99, gold: 149, onLand: 1111 }
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:45 PM", "07:05 PM", "10:25 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["06:00 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "jle-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["01:30 PM", "04:30 PM", "07:30 PM", "10:30 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "jle-cinemas",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["04:45 PM", "10:00 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "jle-cinemas",
    movieId: "fight-maha",
    date: GUNTUR_DATE,
    times: ["02:50 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "gs-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:15 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    movieId: "khalifa-the-ruler",
    date: SUNDAY_DATE,
    times: ["01:45 PM"]
  }),
  ...createShows({
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    movieId: "khalifa-the-ruler",
    date: SUNDAY_DATE,
    times: ["03:45 PM", "10:15 PM"]
  }),

  // ==========================================
  // 2. VIJAYAWADA SHOWS
  // ==========================================
  ...createShows({
    locationId: "vijayawada",
    theatreId: "capital-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "capital-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "07:00 PM", "10:00 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "capital-cinemas",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["04:15 PM", "09:15 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "capital-cinemas",
    movieId: "debba-debba",
    date: GUNTUR_DATE,
    times: ["02:00 PM", "06:30 PM", "10:00 PM"],
    priceOverrides: { premium: 99, gold: 159, onLand: 999 }
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-urvasi",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:45 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-urvasi",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:15 PM", "07:15 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-urvasi",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["06:00 PM", "10:15 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "g3-raj-yuvraj",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "g3-raj-yuvraj",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:45 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-pvp",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:15 PM", "06:15 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-pvp",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:30 PM", "07:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-pvp",
    movieId: "paw-patrol-the-dino-movie",
    date: GUNTUR_DATE,
    times: ["01:30 PM", "04:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "pvr-ripples",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "pvr-ripples",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "07:00 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "pvr-ripples",
    movieId: "paw-patrol-the-dino-movie",
    date: GUNTUR_DATE,
    times: ["02:00 PM", "05:00 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-laila",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-laila",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "07:00 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "ravi-cinemas",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "ravi-cinemas",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "tara-screens",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-lepl-icon",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-lepl-icon",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:15 PM", "07:15 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "inox-lepl-icon",
    movieId: "khalifa-the-ruler",
    date: SUNDAY_DATE,
    times: ["02:45 PM", "06:45 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-power-one",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-power-one",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "07:00 PM"]
  }),
  ...createShows({
    locationId: "vijayawada",
    theatreId: "cinepolis-power-one",
    movieId: "insidious-out-of-the-further",
    date: GUNTUR_DATE,
    times: ["06:00 PM", "10:00 PM"]
  }),

  // ==========================================
  // 3. NARASARAOPETA / NRT SHOWS
  // ==========================================
  ...createShows({
    locationId: "nrt",
    theatreId: "geetha-multiplex",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "geetha-multiplex",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["03:00 PM", "07:00 PM"]
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "geetha-multiplex",
    movieId: "dc",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:45 PM", "09:45 PM"]
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "geetha-multiplex",
    movieId: "debba-debba",
    date: GUNTUR_DATE,
    times: ["02:45 PM", "06:45 PM", "09:45 PM"],
    priceOverrides: { premium: 89, gold: 129, onLand: 777 }
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "eswar-mahal-deluxe",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "vijetha-deluxe",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "nrt",
    theatreId: "lakshmi-narasimha",
    movieId: "hushar-pittalu",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),

  // ==========================================
  // 4. SATTENAPALLI SHOWS
  // ==========================================
  ...createShows({
    locationId: "sattenapalli",
    theatreId: "sri-lakshmi-sattenapalli",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["06:30 PM", "09:30 PM"]
  }),
  ...createShows({
    locationId: "sattenapalli",
    theatreId: "sai-krishna-sattenapalli",
    movieId: "vishwanath-and-sons",
    date: GUNTUR_DATE,
    times: ["06:30 PM", "09:30 PM"]
  }),

  // ==========================================
  // 5. EDLAPADU SHOWS
  // ==========================================
  ...createShows({
    locationId: "edlapadu",
    theatreId: "jayalakshmi-edlapadu",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:30 PM", "06:30 PM", "09:30 PM"]
  }),

  // ==========================================
  // 6. MARTUR SHOWS
  // ==========================================
  ...createShows({
    locationId: "martur",
    theatreId: "nr-cinemas-martur",
    movieId: "irumudi",
    date: GUNTUR_DATE,
    times: ["02:15 PM", "06:15 PM", "09:10 PM"]
  })
];
