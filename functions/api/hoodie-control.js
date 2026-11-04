// DARKOVISION HOODIE GIVEAWAY CONTROL
// Only Kick user 1575632 can operate the giveaway.

const BROADCASTER_ID = '1575632'
const GIVEAWAY_ID = 'darkovision_hoodie_live_2026_01'

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || ''

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...value] = cookie.trim().split('=')

    if (key === name) {
      return value.join('=')
    }
  }

  return null
}

async function authenticate(request, env) {
  const sessionId = getCookie(request, 'kick_viewer_session')

  if (!sessionId) return false

  const session = await env.FISH_DB
    .prepare(`
      SELECT kick_user_id
      FROM kick_viewer_sessions
      WHERE session_id = ?
        AND expires_at > ?
    `)
    .bind(sessionId, Date.now())
    .first()

  return (
    session &&
    String(session.kick_user_id) === BROADCASTER_ID
  )
}

async function ensureGiveaway(env) {
  await env.FISH_DB.prepare(`
    CREATE TABLE IF NOT EXISTS hoodie_giveaways (
      id TEXT PRIMARY KEY,
      active INTEGER NOT NULL DEFAULT 0,
      odds_denominator INTEGER NOT NULL DEFAULT 1000,
      claimed_by TEXT,
      claimed_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `).run()

  await env.FISH_DB
    .prepare(`
      INSERT OR IGNORE INTO hoodie_giveaways (
        id,
        active,
        odds_denominator
      )
      VALUES (?, 0, 1000)
    `)
    .bind(GIVEAWAY_ID)
    .run()
}

async function getGiveaway(env) {
  return await env.FISH_DB
    .prepare(`
      SELECT
        id,
        active,
        odds_denominator,
        claimed_by,
        claimed_at
      FROM hoodie_giveaways
      WHERE id = ?
    `)
    .bind(GIVEAWAY_ID)
    .first()
}

// GET: Check giveaway status.
export async function onRequestGet({ request, env }) {
  try {
    if (!(await authenticate(request, env))) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await ensureGiveaway(env)

    const giveaway = await getGiveaway(env)

    return Response.json(
      { success: true, giveaway },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Hoodie status error:', error)

    return Response.json(
      { error: 'Could not load giveaway' },
      { status: 500 }
    )
  }
}

// POST: Start or stop giveaway.
export async function onRequestPost({ request, env }) {
  try {
    if (request.headers.get('Origin') !== 'https://darko.wtf') {
      return Response.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }

    if (!(await authenticate(request, env))) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    const action = body?.action

    if (action !== 'start' && action !== 'stop') {
      return Response.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    await ensureGiveaway(env)

    if (action === 'start') {
      const odds = Number(body.odds ?? 1000)

      if (
        !Number.isSafeInteger(odds) ||
        odds < 100 ||
        odds > 1000000
      ) {
        return Response.json(
          { error: 'Odds must be between 100 and 1000000' },
          { status: 400 }
        )
      }

      const result = await env.FISH_DB
        .prepare(`
          UPDATE hoodie_giveaways
          SET active = 1,
              odds_denominator = ?
          WHERE id = ?
            AND claimed_by IS NULL
            AND active = 0
        `)
        .bind(odds, GIVEAWAY_ID)
        .run()

      if (Number(result.meta?.changes ?? 0) !== 1) {
        return Response.json(
          {
            success: false,
            error: 'Giveaway already active or claimed'
          },
          { status: 409 }
        )
      }
    }

    if (action === 'stop') {
      await env.FISH_DB
        .prepare(`
          UPDATE hoodie_giveaways
          SET active = 0
          WHERE id = ?
        `)
        .bind(GIVEAWAY_ID)
        .run()
    }

    const giveaway = await getGiveaway(env)

    return Response.json({
      success: true,
      giveaway
    })
  } catch (error) {
    console.error('Hoodie control error:', error)

    return Response.json(
      { error: 'Giveaway control failed' },
      { status: 500 }
    )
  }
}