export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url)
    const username = url.searchParams.get('username')

    if (!username) {
      return new Response('Username is required', {
        status: 400,
      })
    }

    const player = await env.FISH_DB
      .prepare(`
        SELECT
          username,
          coins,
          catches,
          biggest_weight,
          biggest_species
        FROM players
        WHERE username = ?
      `)
      .bind(username)
      .first()

    if (!player) {
      return new Response('Player not found', {
        status: 404,
      })
    }

    return Response.json({
      success: true,
      player,
    })
  } catch (error) {
    console.error('Player lookup error:', error)

    return new Response('Failed to load player', {
      status: 500,
    })
  }
}