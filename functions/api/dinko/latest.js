export async function onRequestGet({ env }) {
  try {
    const play = await env.FISH_DB
      .prepare(`
        SELECT
          id,
          username,
          wager,
          slot_index,
          multiplier,
          payout,
          status,
          created_at
        FROM dinko_plays
        WHERE status = 'queued'
        ORDER BY id ASC
        LIMIT 1
      `)
      .first()

    return Response.json({
      success: true,
      play: play || null,
    })
  } catch (error) {
    console.error('DINKO latest error:', error)

    return Response.json(
      {
        success: false,
        error: 'Failed to load DINKO play',
      },
      { status: 500 }
    )
  }
}