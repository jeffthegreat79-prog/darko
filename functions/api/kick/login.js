function base64UrlEncode(bytes) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function randomString(length = 32) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return base64UrlEncode(new Uint8Array(digest))
}

export async function onRequestGet(context) {
  const { env } = context

  if (!env.KICK_CLIENT_ID) {
    return new Response('Missing KICK_CLIENT_ID', {
      status: 500,
    })
  }

  const codeVerifier = randomString(32)
  const codeChallenge = await createCodeChallenge(codeVerifier)
  const state = randomString(24)

  const redirectUri = 'https://darko.wtf/api/kick/callback'

  const params = new URLSearchParams({
    client_id: env.KICK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
   scope: 'user:read events:subscribe chat:write',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const authorizationUrl =
    `https://id.kick.com/oauth/authorize?${params.toString()}`

  const headers = new Headers({
    Location: authorizationUrl,
    'Cache-Control': 'no-store',
  })

  headers.append(
    'Set-Cookie',
    `kick_code_verifier=${codeVerifier}; Path=/api/kick; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  )

  headers.append(
    'Set-Cookie',
    `kick_oauth_state=${state}; Path=/api/kick; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  )

  return new Response(null, {
    status: 302,
    headers,
  })
}