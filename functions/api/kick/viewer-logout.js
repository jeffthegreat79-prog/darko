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

export async function onRequestPost({ request, env }) {
  try {
    const sessionId = getCookie(request, 'kick_viewer_session')

    if (sessionId) {
      await env.FISH_DB
        .prepare(`
          DELETE FROM kick_viewer_sessions
          WHERE session_id = ?
        `)
        .bind(sessionId)
        .run()
    }

    return Response.json(
      {
        success: true,
      },
      {
        headers: {
          'Set-Cookie':
            'kick_viewer_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Kick viewer logout error:', error)

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}