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

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  if (oauthError) {
    return new Response(`Kick authorization failed: ${oauthError}`, {
      status: 400,
    })
  }

  const savedState = getCookie(request, 'kick_oauth_state')
  const codeVerifier = getCookie(request, 'kick_code_verifier')

  if (!code || !state) {
    return new Response('Missing authorization code or state.', {
      status: 400,
    })
  }

  if (!savedState || state !== savedState) {
    return new Response('OAuth state check failed.', {
      status: 400,
    })
  }

  if (!codeVerifier) {
    return new Response('Missing PKCE code verifier.', {
      status: 400,
    })
  }

  if (!env.KICK_CLIENT_ID || !env.KICK_CLIENT_SECRET) {
    return new Response('Missing Kick credentials in Cloudflare.', {
      status: 500,
    })
  }

  const redirectUri = 'https://darko.wtf/api/kick/callback'

  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.KICK_CLIENT_ID,
    client_secret: env.KICK_CLIENT_SECRET,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    code,
  })

  const tokenResponse = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody,
  })

  const tokenData = await tokenResponse.json()

  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error('Kick token error:', tokenData)

    return new Response(
      `Could not get Kick access token: ${JSON.stringify(tokenData)}`,
      {
        status: 500,
      }
    )
  }
const expiresIn = Number(tokenData.expires_in)
const expiresAt = Date.now() + expiresIn * 1000

await env.FISH_DB
  .prepare(`
    INSERT INTO kick_auth (
      id,
      access_token,
      refresh_token,
      expires_at,
      scope,
      updated_at
    )
    VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)

    ON CONFLICT(id) DO UPDATE SET
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      scope = excluded.scope,
      updated_at = CURRENT_TIMESTAMP
  `)
  .bind(
    tokenData.access_token,
    tokenData.refresh_token,
    expiresAt,
    tokenData.scope || ''
  )
  .run()

console.log('Kick OAuth tokens saved to D1')
  const subscriptionResponse = await fetch(
    'https://api.kick.com/public/v1/events/subscriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          {
            name: 'chat.message.sent',
            version: 1,
          },
        ],
        method: 'webhook',
      }),
    }
  )

  const subscriptionData = await subscriptionResponse.json()

  if (!subscriptionResponse.ok) {
    console.error('Kick subscription error:', subscriptionData)

    return new Response(
      `Kick login worked, but event subscription failed: ${JSON.stringify(
        subscriptionData
      )}`,
      {
        status: 500,
      }
    )
  }

  console.log('Kick subscription created:', subscriptionData)

  const headers = new Headers({
    'Content-Type': 'text/plain; charset=UTF-8',
    'Cache-Control': 'no-store',
  })

  headers.append(
    'Set-Cookie',
    'kick_code_verifier=; Path=/api/kick; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  )

  headers.append(
    'Set-Cookie',
    'kick_oauth_state=; Path=/api/kick; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  )

  return new Response(
    'DarkosFishinPond is connected to Kick! Chat event subscription created successfully.',
    {
      status: 200,
      headers,
    }
  )
}