async function sendKickChatMessage(env, content) {
  try {
    const auth = await env.FISH_DB
      .prepare(`
        SELECT access_token, expires_at
        FROM kick_auth
        WHERE id = 1
      `)
      .first()

    if (!auth?.access_token) {
      console.warn('No Kick access token saved yet')
      return
    }

    if (Number(auth.expires_at) <= Date.now()) {
      console.warn('Kick access token has expired')
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