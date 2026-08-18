export async function onRequestPost(context) {
  const { env, request } = context

  try {
    const body = await request.json()
    const commandId = Number(body.id)

    if (!commandId) {
      return Response.json(
        {
          success: false,
          claimed: false,
          error: 'Invalid command id',
        },
        { status: 400 }
      )
    }

    const claimedAt = Math.floor(Date.now() / 1000)

    const result = await env.FISH_DB
      .prepare(`
        UPDATE fish_commands
        SET claimed_at = ?
        WHERE id = ?
          AND claimed_at IS NULL
      `)
      .bind(claimedAt, commandId)
      .run()

    const claimed = Number(result.meta?.changes ?? 0) === 1

    return Response.json(
      {
        success: true,
        claimed,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Fish command claim error:', error)

    return Response.json(
      {
        success: false,
        claimed: false,
        error: 'Could not claim fish command',
      },
      { status: 500 }
    )
  }
}