
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
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url)
    const requestId = url.searchParams.get('requestId')

    // Validate the original wager ID.
    if (
      typeof requestId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)
    ) {
      return reply({
        success: false,
        error: 'Invalid request ID',
      }, 400)
    }

    // Verify the viewer's Kick login session.
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

    // Retrieve only this viewer's website wager.
    const play = await env.FISH_DB
      .prepare(`
        SELECT
          id,
          username,
          wager,
          slot_index,
          multiplier,
          payout
        FROM dinko_plays
        WHERE kick_message_id = ?
          AND username = ? COLLATE NOCASE
          AND status = 'website'
        LIMIT 1
      `)
      .bind(
        `website:${requestId}`,
        session.username
      )
      .first()

    if (!play) {
      return reply({
        success: false,
        error: 'Wager not found',
      }, 404)
    }

    return reply({
      success: true,
      play: {
        id: play.id,
        username: play.username,
        wager: Number(play.wager),
        slot_index: Number(play.slot_index),
        multiplier: Number(play.multiplier),
        payout: Number(play.payout),
      },
    })

  } catch (error) {
    console.error('Plinko recovery error:', error)

    return reply({
      success: false,
      error: 'Unable to recover wager',
    }, 500)
  }
}
