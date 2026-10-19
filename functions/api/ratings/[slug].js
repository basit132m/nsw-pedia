/**
 * Visitor ratings for one ROM.
 *
 *   GET  /api/ratings/<slug>  -> { average, count, yourScore }
 *   POST /api/ratings/<slug>  -> same, after recording { score: 1-5 }
 *
 * Backed by the D1 binding `DB`. If the binding is missing the endpoint
 * reports that cleanly rather than throwing, so the page degrades to "not
 * available" instead of breaking.
 */

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/**
 * A stable per-visitor key that is not reversible to an IP address. The salt
 * keeps the hash from being brute-forced across the small IP space.
 */
async function voterKey(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
  const ua = request.headers.get('User-Agent') ?? '';
  const salt = env.RATING_SALT ?? 'nswpedia-default-salt';
  const data = new TextEncoder().encode(`${salt}:${ip}:${ua}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function aggregate(env, slug, voter) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS count, AVG(score) AS average FROM ratings WHERE slug = ?',
  )
    .bind(slug)
    .first();

  const mine = await env.DB.prepare('SELECT score FROM ratings WHERE slug = ? AND voter = ?')
    .bind(slug, voter)
    .first();

  return {
    count: row?.count ?? 0,
    // One decimal is all the precision a 1-5 scale deserves.
    average: row?.average ? Math.round(row.average * 10) / 10 : null,
    yourScore: mine?.score ?? null,
  };
}

export async function onRequestGet({ params, request, env }) {
  if (!SLUG.test(params.slug)) return json({ error: 'bad_slug' }, 400);
  if (!env.DB) return json({ error: 'not_configured' }, 503);
  const voter = await voterKey(request, env);
  return json(await aggregate(env, params.slug, voter));
}

export async function onRequestPost({ params, request, env }) {
  if (!SLUG.test(params.slug)) return json({ error: 'bad_slug' }, 400);
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  let score;
  try {
    ({ score } = await request.json());
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return json({ error: 'score_out_of_range' }, 400);
  }

  const voter = await voterKey(request, env);

  // Re-voting replaces the previous score instead of adding another row.
  await env.DB.prepare(
    `INSERT INTO ratings (slug, voter, score) VALUES (?, ?, ?)
     ON CONFLICT (slug, voter) DO UPDATE SET score = excluded.score, updated_at = datetime('now')`,
  )
    .bind(params.slug, voter, score)
    .run();

  return json(await aggregate(env, params.slug, voter));
}
