# TicketX

A movie-ticket booking site for 11 Indian cities. It shows the films actually running, at the real cinemas with their real showtimes, screens and seat classes. Seats are picked on a District / BookMyShow-style seat map, with a 3D view of the auditorium as an option. Built with Next.js 16, React 19, Tailwind CSS 4, framer-motion and React Three Fiber.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Cities

Hyderabad, Bengaluru, Chennai, Mumbai, Delhi NCR, Pune, Kolkata, Kochi, Visakhapatnam, Vijayawada and Guntur. Each city has 7–15 localities to choose from (`src/lib/cities.ts`). "Use my current location" picks the nearest city and sorts cinemas by real distance. The chosen city is kept in a cookie, so the server only sends that city's data.

## Films, cinemas and showtimes

All listings come from District's public movie pages and are snapshotted into `src/data`:

| File | Contents |
| --- | --- |
| `movies.json` | Every film: poster, backdrop, CBFC certificate, runtime, genres, cast with photos, critic scores, official trailer (the Telugu one when there is one) |
| `cities/<city>.json` | That city's top films, every cinema showing them (name, address, coordinates, logo, facilities, cancellation policy) and two days of showtimes: auditorium, format, language, sound tag, and each seat class with its price, seat count and seats free |
| `upcoming.json` | Films releasing soon |

To refresh, re-run the snapshot. It takes about a minute for all cities.

```bash
node scripts/snapshot.cjs              # all cities + upcoming films
node scripts/snapshot.cjs pune kochi   # just some cities
node scripts/snapshot.cjs --upcoming   # just the upcoming list
```

For dates after the snapshot, each film's busiest listed day is carried forward, and the showtimes page says so. Films that only have advance bookings show their real show dates.

## Booking

- **Seats:** up to 10 per booking, all in one seat class. Tapping a seat fills the rest of your tickets to its right, as in the cinema apps.
- **Seat map (default):** classes are stacked from the dearest at the back to the cheapest at the front, with the screen at the bottom. Each class keeps its listed seat count and price, and exactly the listed number of seats show as sold. Chains don't publish seat-by-seat plans, so row lengths and aisles are laid out from those counts.
- **3D view:**
  - the same plan as a stadium-seated auditorium, with one step per row and amber aisle step lights
  - recliners with footrests, armrests, and rails between classes
  - a curved screen showing the film's backdrop, a stage, acoustic wall panels, a projector beam and exit signs
  - "View from seat" puts the camera at eye height in your seat
- **Checkout:** a demo with promo codes. It collects no payment details. The e-ticket flips to an entry QR, and cancellations refund the ticket amount.

## Motion

- **Home carousel:** posters on a 3D arc with floor reflections.
- **Poster cards:** tilt toward the cursor (mouse devices only).
- **Page transitions:** React `<ViewTransition>` morphs posters into the movie page and slides on navigation.

TicketX is not affiliated with District or BookMyShow.
