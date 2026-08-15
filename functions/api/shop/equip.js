export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()

    const username = String(body.username ?? '').trim()
    const itemType = body.itemType
    const itemName = String(body.itemName ?? '').trim()

    if (!username || !itemType || !itemName) {
      return Response.json(
        {
          success: false,
          error: 'Missing username, itemType, or itemName',
        },
        { status: 400 }
      )
    }

    if (itemType !== 'rod' && itemType !== 'bait') {
      return Response.json(
        {
          success: false,
          error: 'Invalid item type',
        },
        { status: 400 }
      )
    }

    const player = await env.FISH_DB
      .prepare(`
        SELECT username
        FROM players
        WHERE LOWER(username) = LOWER(?)
      `)
      .bind(username)
      .first()

    if (!player) {
      return Response.json(
        {
          success: false,
          error: 'Player not found',
        },
        { status: 404 }
      )
    }

    const ownedItem = await env.FISH_DB
      .prepare(`
        SELECT quantity
        FROM player_items
        WHERE LOWER(username) = LOWER(?)
          AND item_type = ?
          AND item_name = ?
      `)
      .bind(player.username, itemType, itemName)
      .first()

    if (!ownedItem || ownedItem.quantity <= 0) {
      return Response.json(
        {
          success: false,
          error: 'Item not owned',
        },
        { status: 400 }
      )
    }

    if (itemType === 'rod') {
      await env.FISH_DB
        .prepare(`
          INSERT INTO player_loadout
            (username, equipped_rod, equipped_bait)
          VALUES (?, ?, NULL)
          ON CONFLICT(username)
          DO UPDATE SET equipped_rod = excluded.equipped_rod
        `)
        .bind(player.username, itemName)
        .run()
    }

    if (itemType === 'bait') {
      await env.FISH_DB
        .prepare(`
          INSERT INTO player_loadout
            (username, equipped_rod, equipped_bait)
          VALUES (?, NULL, ?)
          ON CONFLICT(username)
          DO UPDATE SET equipped_bait = excluded.equipped_bait
        `)
        .bind(player.username, itemName)
        .run()
    }

    const loadout = await env.FISH_DB
      .prepare(`
        SELECT equipped_rod, equipped_bait
        FROM player_loadout
        WHERE username = ?
      `)
      .bind(player.username)
      .first()

    return Response.json({
      success: true,
      loadout,
    })
  } catch (error) {
    console.error('Equip item error:', error)

    return Response.json(
      {
        success: false,
        error: 'Failed to equip item',
      },
      { status: 500 }
    )
  }
}