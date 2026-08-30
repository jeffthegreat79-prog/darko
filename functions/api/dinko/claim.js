export async function onRequestPost({ env }) {
  try {
    const play = await env.FISH_DB
      .prepare(`
        UPDATE dinko_plays
        SET status = 'playing'
        WHERE id = (
          SELECT id
          FROM dinko_plays
          WHERE status = 'queued'
          ORDER BY id ASC
          LIMIT 1
        )
        AND status = 'queued'
        RETURNING
          id,
          username,
          wager,
          slot_index,
          multiplier,
          payout,
          status,
          created_at
      `)
      .first()

    return Response.json({
      success: true,
      play: play || null,
    })
  } catch (error) {
    console.error('DINKO claim error:', error)

    return Response.json(
      {
        success: false,
        error: 'Failed to claim DINKO play',
      },
      { status: 500 }
    )
  }
}