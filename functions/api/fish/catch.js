async function sendKickChatMessage(env, content) {
  try {
    const auth = await env.FISH_DB
      .prepare(`
        SELECT access_token, refresh_token, expires_at
        FROM kick_auth
        WHERE id = 1
      `)
      .first()

    if (!auth?.access_token) {
      console.warn('No Kick access token saved yet')
      return
    }

   if (Number(auth.expires_at) <= Date.now() + 60_000) {
  console.log('Kick access token expired or expiring soon; refreshing...')

  if (!auth.refresh_token) {
    console.warn('No Kick refresh token saved')
    return
  }

  const refreshBody = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.KICK_CLIENT_ID,
    client_secret: env.KICK_CLIENT_SECRET,
    refresh_token: auth.refresh_token,
  })

  const refreshResponse = await fetch(
    'https://id.kick.com/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: refreshBody,
    }
  )

  const refreshData = await refreshResponse.json()

  if (!refreshResponse.ok || !refreshData.access_token) {
    console.error('Kick token refresh failed:', refreshData)
    return
  }

  const expiresAt =
    Date.now() + Number(refreshData.expires_in) * 1000

  const nextRefreshToken =
    refreshData.refresh_token || auth.refresh_token

  await env.FISH_DB
    .prepare(`
      UPDATE kick_auth
      SET access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)
    .bind(
      refreshData.access_token,
      nextRefreshToken,
      expiresAt
    )
    .run()

  auth.access_token = refreshData.access_token
  auth.refresh_token = nextRefreshToken
  auth.expires_at = expiresAt

  console.log('Kick access token refreshed')
}
const userResponse = await fetch('https://api.kick.com/public/v1/users', {
  headers: {
    Authorization: `Bearer ${auth.access_token}`,
  },
})

const userData = await userResponse.json()

if (!userResponse.ok) {
  console.error('Could not get Kick user:', userData)
  return
}

const broadcasterUserId = userData?.data?.[0]?.user_id

if (!broadcasterUserId) {
  console.error('No Kick broadcaster user ID found')
  return
}
    const response = await fetch('https://api.kick.com/public/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        'Content-Type': 'application/json',
      },
   body: JSON.stringify({
  content,
  type: 'user',
  broadcaster_user_id: broadcasterUserId,
}),
    })

    if (!response.ok) {
      const errorText = await response.text()

      console.error(
        'Kick chat message failed:',
        response.status,
        errorText
      )
    }
  } catch (error) {
    console.error('Kick chat request error:', error)
  }
}
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()

    const username = body.username
    const species = body.species
    const weight = Number(body.weight)
    const coins = Math.floor(Number(body.coins))

    if (
      !username ||
      !species ||
      !Number.isFinite(weight) ||
      !Number.isFinite(coins)
    ) {
      return new Response('Missing or invalid catch data', {
        status: 400,
      })
    }

    await env.FISH_DB
      .prepare(`
        INSERT INTO players (
          username,
          coins,
          catches,
          biggest_weight,
          biggest_species
        )
        VALUES (?, ?, 1, ?, ?)

        ON CONFLICT(username) DO UPDATE SET
          coins = players.coins + excluded.coins,
          catches = players.catches + 1,

          biggest_weight =
            CASE
              WHEN excluded.biggest_weight > players.biggest_weight
              THEN excluded.biggest_weight
              ELSE players.biggest_weight
            END,

          biggest_species =
            CASE
              WHEN excluded.biggest_weight > players.biggest_weight
              THEN excluded.biggest_species
              ELSE players.biggest_species
            END,

          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(username, coins, weight, species)
      .run()
await sendKickChatMessage(
  env,
  `🎣 ${username} caught a ${weight.toFixed(1)} lb ${species}! +${coins} coins`
)
    return Response.json({
      success: true,
      username,
      species,
      weight,
      coins,
    })
  } catch (error) {
    console.error('Fish catch save error:', error)

    return new Response('Failed to save catch', {
      status: 500,
    })
  }
}