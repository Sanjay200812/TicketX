# TicketX

A movie-ticket booking site for Hyderabad. It shows real films now in cinemas from TMDB, real Hyderabad theatres, and a 3D auditorium for picking seats. Built with Next.js 16, React 19, Tailwind CSS 4, framer-motion and React Three Fiber.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Films

By default the site shows the films listed for Hyderabad on District and BookMyShow: 21 now showing and 10 coming soon. Each has its poster, backdrop, CBFC certificate, runtime, cast photos, critic scores and the official trailer (the Telugu one when there is one). The data lives in `src/data/district.json`. To refresh it, run `node scripts/district-snapshot.cjs <district-slugs…>` with the movie slugs from district.in. Then edit `NOW_COUNT` in `src/lib/district.ts`.

### Optional: live films from TMDB

1. Create a free account at themoviedb.org and get an API key under **Settings → API**.
2. Copy `.env.local.example` to `.env.local` and paste the key into `TMDB_API_KEY` (or the v4 token into `TMDB_READ_ACCESS_TOKEN`).
3. Restart `npm run dev`.

The server fetches films releasing in India over the last ~6 weeks and the next ~10 weeks, weighted toward Telugu, Hindi, English and Tamil for a Hyderabad audience. It adds posters, backdrops, cast photos, crew, CBFC certificates and official YouTube trailers. Results are cached for an hour, and the key never reaches the browser. Without a key, the site runs on built-in demo films and says so in the footer.

## Theatres

`src/lib/catalog.ts` lists real Hyderabad cinemas: AMB Cinemas, Prasads (PCX), Allu Cinemas (Dolby Cinema), PVR Inorbit (IMAX), INOX GVK One, PVR Central, AAA Cinemas, single screens at RTC X Roads, and others. Premium formats come from public listings. Screen counts, seat plans and coordinates are approximations. Cinemas are sorted by distance from the area you choose, or from your GPS location.

Showtimes, prices and seat availability are simulated, since Indian chains don't offer a public showtime API. Checkout is a demo and collects no payment details.

## 3D and motion

- **3D auditorium** (`src/components/Auditorium3D.tsx`): stadium seating built from the seat plan, tier-coloured velvet and leather seats, and the film's backdrop on the screen. Tap seats in 3D. "View from seat" flies the camera to eye height at your seat. It renders on demand to save battery.
- **Home carousel:** posters on a 3D arc with floor reflections; swipe, drag, click or use the arrow keys.
- **Poster cards** tilt toward the cursor with a light glare (mouse devices only).
- **E-ticket** flips in 3D to a full-size entry QR.
- **Page transitions** use React `<ViewTransition>`: posters morph into the movie page, and forward and back navigation slides.
