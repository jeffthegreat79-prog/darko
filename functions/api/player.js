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
const [itemsResult, loadout] = await Promise.all([
  env.FISH_DB
    .prepare(`
      SELECT item_type, item_name, quantity
      FROM player_items
      WHERE LOWER(username) = LOWER(?)
      ORDER BY item_type, item_name
    `)
    .bind(player.username)
    .all(),

  env.FISH_DB
    .prepare(`
      SELECT equipped_rod, equipped_bait
      FROM player_loadout
      WHERE LOWER(username) = LOWER(?)
    `)
    .bind(player.username)
    .first(),
])
    return Response.json({
  success: true,
  player: {
    ...player,
    items: itemsResult.results ?? [],
    loadout: loadout ?? {
      equipped_rod: null,
      equipped_bait: null,
    },
  },
})
  } catch (error) {
    console.error('Player lookup error:', error)

    return new Response('Failed to load player', {
      status: 500,
    })
  }
}