const RODS = {
  "Grandpa's Old Rod": 0,
  "Fiberglass Rod": 150,
  "Carbon Rod": 500,
  "Legendary Rod": 1500,
}

const BAITS = {
  Worm: 10,
  Minnow: 40,
  Cricket: 75,
  "Golden Lure": 200,
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()

    const username = String(body.username ?? '').trim()
    const itemType = body.itemType
    const itemName = body.itemName

    if (!username || !itemType || !itemName) {
      return Response.json(
        {
          success: false,
          error: 'Missing username, itemType, or itemName',
        },
        { status: 400 }
      )
    }

    const catalog =
      itemType === 'rod'
        ? RODS
        : itemType === 'bait'
          ? BAITS
          : null

    if (
      !catalog ||
      !Object.prototype.hasOwnProperty.call(catalog, itemName)
    ) {
      return Response.json(
        {
          success: false,
          error: 'Invalid shop item',
        },
        { status: 400 }
      )
    }

    const cost = catalog[itemName]

    const player = await env.FISH_DB
      .prepare(`
        SELECT username, coins
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

    if (player.coins < cost) {
      return Response.json(
        {
          success: false,
          error: 'Not enough coins',
        },
        { status: 400 }
      )
    }

    if (itemType === 'rod') {
      const alreadyOwned = await env.FISH_DB
        .prepare(`
          SELECT 1
          FROM player_items
          WHERE LOWER(username) = LOWER(?)
            AND item_type = 'rod'
            AND item_name = ?
        `)
        .bind(player.username, itemName)
        .first()

      if (alreadyOwned) {
        return Response.json(
          {
            success: false,
            error: 'Rod already owned',
          },
          { status: 409 }
        )
      }

      await env.FISH_DB.batch([
        env.FISH_DB
          .prepare(`
            UPDATE players
            SET coins = coins - ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE username = ?
          `)
          .bind(cost, player.username),

        env.FISH_DB
          .prepare(`
            INSERT INTO player_items
              (username, item_type, item_name, quantity)
            VALUES (?, 'rod', ?, 1)
          `)
          .bind(player.username, itemName),
      ])
    }

    if (itemType === 'bait') {
      await env.FISH_DB.batch([
        env.FISH_DB
          .prepare(`
            UPDATE players
            SET coins = coins - ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE username = ?
          `)
          .bind(cost, player.username),

        env.FISH_DB
          .prepare(`
            INSERT INTO player_items
              (username, item_type, item_name, quantity)
            VALUES (?, 'bait', ?, 5)
            ON CONFLICT(username, item_type, item_name)
            DO UPDATE SET quantity = quantity + 5
          `)
          .bind(player.username, itemName),
      ])
    }

    const updatedPlayer = await env.FISH_DB
      .prepare(`
        SELECT coins
        FROM players
        WHERE username = ?
      `)
      .bind(player.username)
      .first()

    const item = await env.FISH_DB
      .prepare(`
        SELECT item_type, item_name, quantity
        FROM player_items
        WHERE username = ?
          AND item_type = ?
          AND item_name = ?
      `)
      .bind(player.username, itemType, itemName)
      .first()

    return Response.json({
      success: true,
      coins: updatedPlayer.coins,
      item,
    })
  } catch (error) {
    console.error('Shop purchase error:', error)

    return Response.json(
      {
        success: false,
        error: 'Failed to complete purchase',
      },
      { status: 500 }
    )
  }
}