const BAITS = {
  worm: { name: 'Worm', cost: 10 },
  minnow: { name: 'Minnow', cost: 40 },
  cricket: { name: 'Cricket', cost: 75 },
  'golden lure': { name: 'Golden Lure', cost: 200 },
  goldenlure: { name: 'Golden Lure', cost: 200 },
}
export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const body = await request.json()

    console.log('Kick webhook received:')
    console.log(JSON.stringify(body, null, 2))

    const message = body.content?.trim().toLowerCase()
    const username = body.sender?.username ?? 'Unknown'
    const kickMessageId = body.message_id

    console.log('Kick chat message:', body.content)

    if (message === '!fish') {
      console.log(`🎣 FISH COMMAND received from ${username}`)

      await env.FISH_DB
        .prepare(`
          INSERT OR IGNORE INTO fish_commands
          (kick_message_id, username, command)
          VALUES (?, ?, ?)
        `)
        .bind(kickMessageId, username, message)
        .run()
await env.FISH_DB
  .prepare(`
    INSERT OR IGNORE INTO players (username)
    VALUES (?)
  `)
  .bind(username)
  .run()
      console.log(`🎣 Saved !fish command for ${username}`)
    }
if (message.toLowerCase().startsWith('!buybait ')) {
  const baitKey = message
    .slice('!buybait '.length)
    .trim()
    .toLowerCase()

  const bait = BAITS[baitKey]

  if (!bait) {
    console.log(`Unknown bait requested by ${username}: ${baitKey}`)
  } else {
    // Make sure the player exists.
    await env.FISH_DB
      .prepare(`
        INSERT OR IGNORE INTO players (username)
        VALUES (?)
      `)
      .bind(username)
      .run()

    const player = await env.FISH_DB
      .prepare(`
        SELECT username, coins
        FROM players
        WHERE LOWER(username) = LOWER(?)
      `)
      .bind(username)
      .first()

    if (!player) {
      console.error(`Could not find player ${username}`)
    } else if (Number(player.coins) < bait.cost) {
      console.log(
        `${username} does not have enough coins for ${bait.name}`
      )
    } else {
      await env.FISH_DB.batch([
        env.FISH_DB
          .prepare(`
            UPDATE players
            SET coins = coins - ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE username = ?
          `)
          .bind(bait.cost, player.username),

        env.FISH_DB
          .prepare(`
            INSERT INTO player_items
              (username, item_type, item_name, quantity)
            VALUES (?, 'bait', ?, 5)
            ON CONFLICT(username, item_type, item_name)
            DO UPDATE SET quantity = quantity + 5
          `)
          .bind(player.username, bait.name),
      ])

      const updatedPlayer = await env.FISH_DB
        .prepare(`
          SELECT coins
          FROM players
          WHERE username = ?
        `)
        .bind(player.username)
        .first()

      console.log(
        `🪱 ${username} bought 5 ${bait.name} for ${bait.cost} coins. Balance: ${updatedPlayer?.coins}`
      )
    }
  }
}
    return new Response('OK', {
      status: 200,
    })
  } catch (error) {
    console.error('Kick webhook error:', error)

    return new Response('Bad Request', {
      status: 400,
    })
  }
}