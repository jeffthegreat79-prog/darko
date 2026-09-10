export const DINKO_SLOTS = [
  { index: 0,  multiplier: 10,  weight: 10 },
  { index: 1,  multiplier: 5,   weight: 30 },
  { index: 2,  multiplier: 3,   weight: 80 },
  { index: 3,  multiplier: 1.5, weight: 200 },
  { index: 4,  multiplier: 1,   weight: 400 },
  { index: 5,  multiplier: 0.8, weight: 680 },
  { index: 6,  multiplier: 0.5, weight: 1200 },
  { index: 7,  multiplier: 0.8, weight: 680 },
  { index: 8,  multiplier: 1,   weight: 400 },
  { index: 9,  multiplier: 1.5, weight: 200 },
  { index: 10, multiplier: 3,   weight: 80 },
  { index: 11, multiplier: 5,   weight: 30 },
  { index: 12, multiplier: 10,  weight: 10 },
]

export function rollDinko(wager) {
  const totalWeight = DINKO_SLOTS.reduce(
    (sum, slot) => sum + slot.weight,
    0
  )

  let roll = Math.random() * totalWeight

  for (const slot of DINKO_SLOTS) {
    roll -= slot.weight

    if (roll <= 0) {
      return {
        slotIndex: slot.index,
        multiplier: slot.multiplier,
        payout: Math.floor(wager * slot.multiplier),
      }
    }
  }

  const fallback = DINKO_SLOTS[4]

  return {
    slotIndex: fallback.index,
    multiplier: fallback.multiplier,
    payout: Math.floor(wager * fallback.multiplier),
  }
}
export async function processDinkoPlay(
  env,
  { kickMessageId, username, wager }
) {
  const cleanWager = Number(wager)

  if (
    !kickMessageId ||
    !username ||
    !Number.isSafeInteger(cleanWager) ||
    cleanWager <= 0
  ) {
    return {
      success: false,
      reason: 'invalid_wager',
    }
  }

  // Prevent the same Kick message from creating two drops
  const existingPlay = await env.FISH_DB
    .prepare(`
      SELECT id
      FROM dinko_plays
      WHERE kick_message_id = ?
      LIMIT 1
    `)
    .bind(kickMessageId)
    .first()

  if (existingPlay) {
    return {
      success: false,
      reason: 'duplicate',
    }
  }

  const player = await env.FISH_DB
    .prepare(`
      SELECT coins
      FROM players
      WHERE username = ? COLLATE NOCASE
      LIMIT 1
    `)
    .bind(username)
    .first()

  if (!player) {
    return {
      success: false,
      reason: 'player_not_found',
    }
  }

  const currentCoins = Number(player.coins) || 0

  if (currentCoins < cleanWager) {
    return {
      success: false,
      reason: 'insufficient_coins',
      coins: currentCoins,
    }
  }

  const result = rollDinko(cleanWager)

  // Wager is removed and winnings are added immediately.
  const updatedPlayer = await env.FISH_DB
    .prepare(`
      UPDATE players
      SET coins = coins - ? + ?
      WHERE username = ? COLLATE NOCASE
        AND coins >= ?
      RETURNING coins
    `)
    .bind(
      cleanWager,
      result.payout,
      username,
      cleanWager
    )
    .first()

  if (!updatedPlayer) {
    return {
      success: false,
      reason: 'insufficient_coins',
    }
  }

  await env.FISH_DB
    .prepare(`
      INSERT INTO dinko_plays (
        kick_message_id,
        username,
        wager,
        slot_index,
        multiplier,
        payout,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'queued')
    `)
    .bind(
      kickMessageId,
      username,
      cleanWager,
      result.slotIndex,
      result.multiplier,
      result.payout
    )
    .run()

  return {
    success: true,
    username,
    wager: cleanWager,
    slotIndex: result.slotIndex,
    multiplier: result.multiplier,
    payout: result.payout,
    coins: Number(updatedPlayer.coins),
  }
}