import { sendKickChatMessage } from '../fish/catch.js'
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()
    const playId = Number(body.id)

    if (!Number.isInteger(playId) || playId <= 0) {
      return Response.json(
        {
          success: false,
          error: 'Invalid DINKO play id',
        },
        { status: 400 }
      )
    }

    const completedPlay = await env.FISH_DB
      .prepare(`
        UPDATE dinko_plays
        SET
          status = 'completed',
          displayed_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND status = 'playing'
        RETURNING
          id,
          username,
          wager,
          slot_index,
          multiplier,
          payout,
          status,
          displayed_at
      `)
      .bind(playId)
      .first()
if (completedPlay) {
  const player = await env.FISH_DB
    .prepare(`
      SELECT coins
      FROM players
      WHERE LOWER(username) = LOWER(?)
    `)
    .bind(completedPlay.username)
    .first()

  const wager = Math.floor(Number(completedPlay.wager) || 0)
  const payout = Math.floor(Number(completedPlay.payout) || 0)
  const multiplier = Number(completedPlay.multiplier)

  let content =
    `🎰 ${completedPlay.username} wagered ${wager} coins ` +
    `and hit ${multiplier}x — payout: ${payout} coins!`

  if (player?.coins !== undefined && player?.coins !== null) {
    content += ` Balance: ${Math.floor(Number(player.coins))} coins 🪙`
  }

  await sendKickChatMessage(env, content)
}
    return Response.json({
      success: true,
      play: completedPlay || null,
    })
  } catch (error) {
    console.error('DINKO complete error:', error)

    return Response.json(
      {
        success: false,
        error: 'Failed to complete DINKO play',
      },
      { status: 500 }
    )
  }
}