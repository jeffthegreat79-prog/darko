export async function onRequestGet(context) {
  const { env } = context

  try {
    const latestCommand = await env.FISH_DB
      .prepare(`
        SELECT id, username, command, created_at
        FROM fish_commands
        ORDER BY id DESC
        LIMIT 1
      `)
      .first()

    return Response.json(latestCommand, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Latest fish command error:', error)

    return Response.json(
      { error: 'Could not load latest fish command' },
      { status: 500 }
    )
  }
}