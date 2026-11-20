// Snapshot District listings into src/data/district.json
const fs = require('fs');
const slugs = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
(async () => {
  const out = [];
  for (const s of slugs) {
    try {
      const h = await (await fetch('https://www.district.in/movies/' + s, { headers: { 'user-agent': UA } })).text();
      const j = JSON.parse(h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
      const m = j.props.pageProps.data.movieData.meta.movie;
      const vids = (m.videos || []).filter((v) => v.videoYtId && v.videoYtId !== 'dummy');
      const tr =
        vids.find((v) => v.videoType === 'Trailer' && v.language === 'Telugu') ||
        vids.find((v) => v.videoType === 'Trailer') ||
        vids[0];
      out.push({
        id: m.content_id,
        name: m.name,
        desc: (m.description || '').split('\n')[0].trim(),
        rel: m.release_date,
        cert: m.censor,
        lang: m.primary_language,
        langs: m.languages,
        genre: m.genre,
        dur: m.duration,
        poster: m.poster,
        hori: m.horizontal_poster,
        yt: tr?.videoYtId || m.heroYtId || null,
        cast: (m.cast_info || []).slice(0, 8).map((c) => ({ name: c.cast_name, photo: c.cast_image })),
        ratings: (m.ratings || []).map((r) => ({ by: r.rated_by, value: Number(r.value), base: Number(r.dwh_source?.rating_base || 5) })),
      });
      process.stdout.write('.');
    } catch (e) {
      console.error('\nfail', s, e.message);
    }
  }
  fs.mkdirSync(require('path').join(__dirname, '../src/data'), { recursive: true });
  fs.writeFileSync(require('path').join(__dirname, '../src/data/district.json'), JSON.stringify(out, null, 1));
  console.log('\nsaved', out.length);
})();
