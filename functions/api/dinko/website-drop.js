
import { rollDinko } from '../../lib/dinko.js'

function getCookie(request, name) {
  const cookies = (request.headers.get('Cookie') || '')
    .split(';')
    .map((cookie) => cookie.trim())

  const match = cookies.find((cookie) =>
    cookie.startsWith(`${name}=`)
  )

  return match ? match.slice(name.length + 1) : null
}

function reply(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function onRequestPost({ request, env }) {
  try {
    const url = new URL(request.url)


const allowedHosts = [
  'darko.wtf',
  'www.darko.wtf',
  'localhost',
  '127.0.0.1',
]

if (!allowedHosts.includes(url.hostname)) {
  return reply({
    success: false,
    error: 'Plinko betting is not available on this host',
  }, 403)
}


    // Prevent cross-site wager requests.
    if (request.headers.get('Origin') !== url.origin) {
      return reply({
        success: false,
        error: 'Invalid request origin',
      }, 403)
    }

    // Verify the Kick session on the server.
    const sessionId = getCookie(
      request,
      'kick_viewer_session'
    )

    if (!sessionId) {
      return reply({
        success: false,
        error: 'Connect Kick first',
      }, 401)
    }

    const session = await env.FISH_DB
      .prepare(`
        SELECT kick_user_id, username
        FROM kick_viewer_sessions
        WHERE session_id = ?
          AND expires_at > ?
        LIMIT 1
      `)
      .bind(sessionId, Date.now())
      .first()

    if (!session) {
      return reply({
        success: false,
        error: 'Kick session expired',
      }, 401)
    }

    const body = await request.json().catch(() => null)

    const wager = body?.wager
    const requestId = body?.requestId

    // Validate the wager.
    if (
      !Number.isSafeInteger(wager) ||
      wager <= 0 ||
      wager > Math.floor(Number.MAX_SAFE_INTEGER / 10)
    ) {
      return reply({
        success: false,
        error: 'Invalid wager',
      }, 400)
    }

    // Every drop needs a unique identifier.
    if (
      typeof requestId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)
    ) {
      return reply({
        success: false,
        error: 'Invalid request ID',
      }, 400)
    }

    const playKey = `website:${requestId}`

    // Calculate the result using existing Plinko odds.
    const result = rollDinko(wager)

    if (!Number.isSafeInteger(result.payout)) {
      return reply({
        success: false,
        error: 'Invalid calculated payout',
      }, 400)
    }

    // Both statements run in one D1 transaction.
    // A duplicate unique key causes a rollback.
    const [insertResult, balanceResult] =
      await env.FISH_DB.batch([
        env.FISH_DB.prepare(`
          INSERT INTO dinko_plays (
            kick_message_id,
            username,
            wager,
            slot_index,
            multiplier,
            payout,
            status
          )
          SELECT ?, username, ?, ?, ?, ?, 'website'
          FROM players
          WHERE username = ? COLLATE NOCASE
            AND coins >= ?
          RETURNING id
        `).bind(
          playKey,
          wager,
          result.slotIndex,
          result.multiplier,
          result.payout,
          session.username,
          wager
        ),

        env.FISH_DB.prepare(`
          UPDATE players
          SET coins = coins - ? + ?
         WHERE username = ? COLLATE NOCASE
  AND EXISTS (
              SELECT 1
              FROM dinko_plays
              WHERE kick_message_id = ?
                AND status = 'website'
            )
          RETURNING coins
        `).bind(
  wager,
  result.payout,
  session.username,
  playKey
),
      ])

    const play = insertResult.results?.[0]
    const balance = balanceResult.results?.[0]

    if (!play || !balance) {
      return reply({
        success: false,
        error: 'Insufficient coins or player not found',
      }, 400)
    }

    return reply({
      success: true,
      play: {
        id: play.id,
        username: session.username,
        wager,
        slot_index: result.slotIndex,
        multiplier: result.multiplier,
        payout: result.payout,
      },
      coins: Number(balance.coins),
    })

  } catch (error) {
    console.error('Website Plinko error:', error)

    if (String(error).includes('UNIQUE constraint')) {
      return reply({
        success: false,
        error: 'Duplicate play request',
      }, 409)
    }

    return reply({
      success: false,
      error: 'Plinko request failed',
    }, 500)
  }
}
