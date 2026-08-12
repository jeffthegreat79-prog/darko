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