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
export async function onRequestPost({ request, env }) {
 try {
  const sessionId = getCookie(request, 'kick_viewer_session')

  if (!sessionId) {
    return Response.json(
      {
        success: false,
        error: 'Connect Kick before equipping fishing gear',
      },
      { status: 401 }
    )
  }

  const session = await env.FISH_DB
    .prepare(`
      SELECT
        username,
        expires_at
      FROM kick_viewer_sessions
      WHERE session_id = ?
    `)
    .bind(sessionId)
    .first()

  if (!session || Number(session.expires_at) <= Date.now()) {
    return Response.json(
      {
        success: false,
        error: 'Kick viewer session is invalid or expired',
      },
      { status: 401 }
    )
  }

  const username = String(session.username ?? '').trim()

  if (!username) {
    return Response.json(
      {
        success: false,
        error: 'Kick viewer session has no username',
      },
      { status: 401 }
    )
  }

  const body = await request.json()

  const itemType = body.itemType
  const itemName = String(body.itemName ?? '').trim()

  if (!itemType || !itemName) {
    return Response.json(
      {
        success: false,
        error: 'Missing itemType or itemName',
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