function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split('=')

    if (key === name) {
      return valueParts.join('=')
    }
  }

  return null
}

export async function onRequestGet({ request, env }) {
  try {
    const sessionId = getCookie(request, 'kick_viewer_session')

    if (!sessionId) {
      return Response.json({
        success: true,
        connected: false,
        viewer: null,
      })
    }

    const session = await env.FISH_DB
      .prepare(`
        SELECT
          kick_user_id,
          username,
          expires_at
        FROM kick_viewer_sessions
        WHERE session_id = ?
      `)
      .bind(sessionId)
      .first()

    if (!session || Number(session.expires_at) <= Date.now()) {
      return Response.json(
        {
          success: true,
          connected: false,
          viewer: null,
        },
        {
          headers: {
            'Set-Cookie':
              'kick_viewer_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          },
        }
      )
    }

    return Response.json({
      success: true,
      connected: true,
      viewer: {
        kickUserId: session.kick_user_id,
        username: session.username,
      },
    })
  } catch (error) {
    console.error('Kick viewer status error:', error)

    return Response.json(
      {
        success: false,
        connected: false,
        viewer: null,
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}