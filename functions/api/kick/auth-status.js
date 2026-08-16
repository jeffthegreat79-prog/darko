export async function onRequestGet({ env }) {
  try {
    const result = await env.FISH_DB
      .prepare(`
        SELECT
          COUNT(*) AS count,
          MAX(updated_at) AS updated_at
        FROM kick_auth
      `)
      .first()

    return Response.json({
      success: true,
      authRows: result?.count ?? 0,
      updatedAt: result?.updated_at ?? null,
    })
  } catch (error) {
    console.error('Kick auth status error:', error)

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}