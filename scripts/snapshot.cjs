#!/usr/bin/env node
/**
 * Snapshot films, cinemas and showtimes from District's public movie pages for each city.
 *
 *   node scripts/snapshot.cjs                # all cities
 *   node scripts/snapshot.cjs hyderabad pune # some cities
 *
 * Writes src/data/movies.json (film details) and src/data/cities/<city>.json
 * (cinemas + the next two days of showtimes with seat classes, prices and availability).
 */
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const BASE = 'https://www.district.in';
const DATA = path.join(__dirname, '../src/data');
const MOVIES_PER_CITY = 14;
const DAYS = 2;

const CITIES = ['hyderabad', 'bengaluru', 'chennai', 'mumbai', 'delhi-ncr', 'pune', 'kolkata', 'kochi', 'vizag', 'vijayawada', 'guntur'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(String(r.status));
      return await r.text();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1500 * (i + 1));
    }
  }
}

const nextData = (h) => JSON.parse(h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);

function rawMovie(m) {
  const vids = (m.videos || []).filter((v) => v.videoYtId && v.videoYtId !== 'dummy');
  const tr = vids.find((v) => v.videoType === 'Trailer' && v.language === 'Telugu') || vids.find((v) => v.videoType === 'Trailer') || vids[0];
  return {
    id: m.content_id,
    name: m.name,
    desc: (m.description || '').split('\n')[0].trim(),
    rel: m.release_date,
    cert: m.censor,
    lang: m.primary_language,
    langs: m.languages || [],
    genre: m.genre || [],
    dur: m.duration,
    poster: m.poster,
    hori: m.horizontal_poster,
    yt: (tr && tr.videoYtId) || m.heroYtId || null,
    trailers: Object.fromEntries(vids.filter((v) => v.videoType === 'Trailer').map((v) => [v.language, v.videoYtId])),
    cast: (m.cast_info || []).slice(0, 8).map((c) => ({ name: c.cast_name, photo: c.cast_image })),
    ratings: (m.ratings || []).map((r) => ({ by: r.rated_by, value: Number(r.value), base: Number((r.dwh_source && r.dwh_source.rating_base) || 5) })),
  };
}

async function cityListing(city) {
  const h = await get(`${BASE}/movies/${city}-movie-tickets`);
  if (!h) return [];
  const seen = new Set();
  const out = [];
  for (const m of h.matchAll(new RegExp(`/movies/([a-z0-9-]+)-movie-tickets-in-${city}-MV(\\d+)`, 'g'))) {
    if (m[1] === city || seen.has(m[2])) continue;
    seen.add(m[2]);
    out.push({ slug: m[1], id: Number(m[2]) });
  }
  return out;
}

async function moviePage(city, slug, id, date) {
  const h = await get(`${BASE}/movies/${slug}-movie-tickets-in-${city}-MV${id}${date ? `?fromdate=${date}` : ''}`);
  if (!h) return null;
  const pp = nextData(h).props.pageProps.data;
  const ss = pp.serverState || {};
  const ms = Object.values(ss.movieSessions || {})[0];
  const meta = (ss.mdpV2MovieData && ss.mdpV2MovieData[id] && ss.mdpV2MovieData[id].movie) || (ms && ms.meta && ms.meta.movie);
  return { meta, ms };
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const k = i++;
        try {
          out[k] = await fn(items[k], k);
        } catch (e) {
          console.error('  !', e.message);
        }
        await sleep(250);
      }
    }),
  );
  return out;
}

async function snapshotCity(city, movies, amenityNames) {
  const listing = (await cityListing(city)).slice(0, MOVIES_PER_CITY);
  const cinemas = new Map();
  const sessions = [];
  const movieIds = [];
  let dates = [];

  await pool(listing, 3, async ({ slug, id }) => {
    const first = await moviePage(city, slug, id);
    if (!first || !first.ms) return;
    if (first.meta) movies.set(id, rawMovie(first.meta));
    const showDates = first.ms.meta.showDates || [];
    const pages = [first];
    for (const d of showDates.slice(1, DAYS)) pages.push(await moviePage(city, slug, id, d));
    let any = false;
    for (const p of pages) {
      if (!p || !p.ms) continue;
      Object.assign(amenityNames, Object.fromEntries(Object.entries(p.ms.meta.amenities || {}).map(([k, v]) => [k, v.name])));
      for (const a of p.ms.arrangedSessions || []) {
        const c = a.data;
        if (!cinemas.has(c.id)) {
          cinemas.set(c.id, {
            id: c.id,
            name: c.name,
            address: c.address,
            lat: c.latitude,
            lng: c.longitude,
            amenities: (c.amenities || []).map(Number),
            cancellable: !!c.isMerchantCancellable,
            logo: c.cinemaLogoUrl || '',
          });
        }
        for (const s of a.sessions || []) {
          const [date, time] = s.showTimeLocal.split('T');
          any = true;
          sessions.push([
            id,
            c.id,
            date,
            time.slice(0, 5),
            s.audi || 'Screen',
            s.scrnFmt || '2D',
            s.lang || '',
            s.premiumLabel || '',
            (s.areas || []).map((ar) => [ar.label, ar.price, ar.sTotal, ar.sAvail]),
          ]);
        }
      }
    }
    if (any) movieIds.push(id);
    dates = [...new Set([...dates, ...showDates.slice(0, DAYS)])].sort();
  });

  // Keep the order District lists films in
  const order = listing.map((l) => l.id).filter((id) => movieIds.includes(id));
  return { city, fetchedAt: new Date().toISOString(), dates, movies: order, cinemas: [...cinemas.values()], sessions };
}

/** Upcoming films, from District's upcoming list (the same list is used for every city) */
async function snapshotUpcoming(movies) {
  const h = await get(`${BASE}/movies/upcoming-movies-in-hyderabad`);
  const ids = [];
  const seen = new Set();
  for (const m of h.matchAll(/\/movies\/([a-z0-9-]+-movie-tickets-MV(\d+))/g)) {
    if (seen.has(m[2])) continue;
    seen.add(m[2]);
    ids.push({ slug: m[1], id: Number(m[2]) });
  }
  const out = [];
  await pool(ids.slice(0, 24), 3, async ({ slug, id }) => {
    const page = await get(`${BASE}/movies/${slug}`);
    if (!page) return;
    const m = nextData(page).props.pageProps.data.movieData.meta.movie;
    if (!m || !m.poster) return;
    movies.set(id, rawMovie(m));
    out.push({ id, rel: m.release_date });
  });
  const today = new Date().toISOString().slice(0, 10);
  return out.filter((x) => !x.rel || x.rel > today || x.rel.startsWith('2090')).map((x) => x.id);
}

(async () => {
  const args = process.argv.slice(2);
  const onlyUpcoming = args.includes('--upcoming');
  const want = onlyUpcoming ? [] : args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : CITIES;
  fs.mkdirSync(path.join(DATA, 'cities'), { recursive: true });
  const moviesPath = path.join(DATA, 'movies.json');
  const movies = new Map((fs.existsSync(moviesPath) ? JSON.parse(fs.readFileSync(moviesPath, 'utf8')) : []).map((m) => [m.id, m]));
  const amenityPath = path.join(DATA, 'amenities.json');
  const amenityNames = fs.existsSync(amenityPath) ? JSON.parse(fs.readFileSync(amenityPath, 'utf8')) : {};

  for (const city of want) {
    process.stdout.write(`${city} … `);
    const data = await snapshotCity(city, movies, amenityNames);
    fs.writeFileSync(path.join(DATA, 'cities', `${city}.json`), JSON.stringify(data));
    console.log(`${data.movies.length} films, ${data.cinemas.length} cinemas, ${data.sessions.length} shows`);
  }
  if (onlyUpcoming || !args.length) {
    process.stdout.write('upcoming … ');
    const up = await snapshotUpcoming(movies);
    fs.writeFileSync(path.join(DATA, 'upcoming.json'), JSON.stringify(up));
    console.log(`${up.length} films`);
  }
  fs.writeFileSync(moviesPath, JSON.stringify([...movies.values()], null, 1));
  fs.writeFileSync(amenityPath, JSON.stringify(amenityNames, null, 1));
  console.log('done');
})();
