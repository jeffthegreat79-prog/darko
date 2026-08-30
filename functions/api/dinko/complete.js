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