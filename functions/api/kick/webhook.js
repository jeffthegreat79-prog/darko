import { sendKickChatMessage } from '../fish/catch.js'
const BAITS = {
  worm: { name: 'Worm', replyName: 'Worms', cost: 10 },
  worms: { name: 'Worm', replyName: 'Worms', cost: 10 },

  minnow: { name: 'Minnow', replyName: 'Minnows', cost: 40 },
  minnows: { name: 'Minnow', replyName: 'Minnows', cost: 40 },

  cricket: { name: 'Cricket', replyName: 'Crickets', cost: 75 },
  crickets: { name: 'Cricket', replyName: 'Crickets', cost: 75 },

  'golden lure': {
    name: 'Golden Lure',
    replyName: 'Golden Lures',
    cost: 200,
  },
  'golden lures': {
    name: 'Golden Lure',
    replyName: 'Golden Lures',
    cost: 200,
  },
  goldenlure: {
    name: 'Golden Lure',
    replyName: 'Golden Lures',
    cost: 200,
  },
  goldenlures: {
    name: 'Golden Lure',
    replyName: 'Golden Lures',
    cost: 200,
  },
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
      const now = Math.floor(Date.now() / 1000)
const cooldownSeconds = 5 * 60

const lastFish = await env.FISH_DB
  .prepare(`
    SELECT created_at
    FROM fish_commands
    WHERE LOWER(username) = LOWER(?)
      AND command = '!fish'
    ORDER BY created_at DESC
    LIMIT 1
  `)
  .bind(username)
  .first()

if (lastFish) {
  const elapsedSeconds =
    now - Number(lastFish.created_at)

  if (elapsedSeconds < cooldownSeconds) {
    const remainingSeconds =
      cooldownSeconds - elapsedSeconds

    const remainingMinutes =
      Math.ceil(remainingSeconds / 60)

    await sendKickChatMessage(
      env,
      `🎣 Nothing's biting at the moment, try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`
    )

    return new Response('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
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
  await sendKickChatMessage(
    env,
    `🎣 ${username}, bait options are: Worms, Minnows, Crickets, Golden Lures`
  )

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
  await sendKickChatMessage(
    env,
    `❌ ${username} doesn't have enough coins! ${bait.replyName} cost ${bait.cost} coins. Balance: ${player.coins} coins`
  )

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
        const updatedBait = await env.FISH_DB
  .prepare(`
    SELECT quantity
    FROM player_items
    WHERE username = ?
      AND item_type = 'bait'
      AND item_name = ?
  `)
  .bind(player.username, bait.name)
  .first()
await sendKickChatMessage(
  env,
  `🪱 ${username} bought 5 ${bait.replyName} for ${bait.cost} coins! Balance: ${updatedPlayer?.coins} coins | ${bait.replyName}: ${updatedBait?.quantity}`
)
      console.log(
        `🪱 ${username} bought 5 ${bait.name} for ${bait.cost} coins. Balance: ${updatedPlayer?.coins}`
      )
    }
  }
}
if (message.toLowerCase() === '!gear') {
  const loadout = await env.FISH_DB
    .prepare(`
      SELECT equipped_rod, equipped_bait
      FROM player_loadout
      WHERE LOWER(username) = LOWER(?)
    `)
    .bind(username)
    .first()

  const equippedRod =
    loadout?.equipped_rod || 'None equipped'

  const equippedBait =
    loadout?.equipped_bait || 'None equipped'

  let baitQuantity = 0

  if (loadout?.equipped_bait) {
    const baitItem = await env.FISH_DB
      .prepare(`
        SELECT quantity
        FROM player_items
        WHERE LOWER(username) = LOWER(?)
          AND item_type = 'bait'
          AND item_name = ?
      `)
      .bind(username, loadout.equipped_bait)
      .first()

    baitQuantity = Number(baitItem?.quantity) || 0
  }

  await sendKickChatMessage(
    env,
    `🎣 ${username}'s Gear | Rod: ${equippedRod} | Bait: ${equippedBait}${loadout?.equipped_bait ? ` (${baitQuantity} left)` : ''}`
  )
}
if (message.toLowerCase() === '!balance') {
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

  const baitResult = await env.FISH_DB
    .prepare(`
      SELECT item_name, quantity
      FROM player_items
      WHERE LOWER(username) = LOWER(?)
        AND item_type = 'bait'
    `)
    .bind(username)
    .all()

  const baitCounts = {
    Worm: 0,
    Minnow: 0,
    Cricket: 0,
    'Golden Lure': 0,
  }

  for (const item of baitResult.results ?? []) {
    if (
      Object.prototype.hasOwnProperty.call(
        baitCounts,
        item.item_name
      )
    ) {
      baitCounts[item.item_name] = Number(item.quantity) || 0
    }
  }

  await sendKickChatMessage(
    env,
    `💰 ${username}: ${player?.coins ?? 0} coins | 🪱 Worms: ${baitCounts.Worm} | 🐟 Minnows: ${baitCounts.Minnow} | 🦗 Crickets: ${baitCounts.Cricket} | ✨ Golden Lures: ${baitCounts['Golden Lure']}`
  )
}
if (message.toLowerCase() === '!fishhelp') {
  await sendKickChatMessage(
    env,
    `🎣 Fishing commands: !fish | !balance | !buybait worms | !buybait minnows | !buybait crickets | !buybait golden lures`
  )
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