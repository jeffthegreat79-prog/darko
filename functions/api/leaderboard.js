export async function onRequestGet({ env }) {
  try {
    const leaderboard = await env.FISH_DB
      .prepare(`
        SELECT
          username,
          coins,
          catches,
          biggest_weight,
          biggest_species
        FROM players
        WHERE catches > 0
        ORDER BY catches DESC, biggest_weight DESC
        LIMIT 10
      `)
      .all()

    return Response.json({
      success: true,
      leaderboard: leaderboard.results ?? [],
    })
  } catch (error) {
    console.error('Leaderboard error:', error)

    return new Response('Failed to load leaderboard', {
      status: 500,
    })
  }
}