const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}
export async function onRequestGet(context) {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    const username = url.searchParams.get('username')?.trim()

    if (!username) {
      return Response.json(
        {
          success: false,
          error: 'Username is required',
        },
        {
  status: 400,
  headers: corsHeaders,
}
      )
    }

    const result = await env.FISH_DB
      .prepare(`
        SELECT
          id,
          username,
          catch_name,
          catch_rarity,
          catch_type,
          catch_weight,
          catch_coins,
          catch_icon,
          catch_is_trophy,
          created_at
        FROM fish_commands
        WHERE LOWER(username) = LOWER(?)
          AND command = '!fish'
          AND processed_at IS NOT NULL
          AND catch_name IS NOT NULL
        ORDER BY id DESC
        LIMIT 25
      `)
      .bind(username)
      .all()

    const catches = (result.results ?? []).map((row) => ({
      id: row.id,
      name: row.catch_name,
      rarity: row.catch_rarity,
      type: row.catch_type || 'fish',
      weight: Number(row.catch_weight),
      value: Number(row.catch_coins),
      icon: row.catch_icon,
      isTrophy: Number(row.catch_is_trophy) === 1,
      username: row.username,
      caughtAt: row.created_at
        ? new Date(Number(row.created_at) * 1000).toISOString()
        : null,
    }))

    return Response.json(
      {
        success: true,
        username,
        catches,
      },
      {
  headers: {
    ...corsHeaders,
    'Cache-Control': 'no-store',
  },
}
    )
  } catch (error) {
    console.error('Fish history error:', error)

    return Response.json(
      {
        success: false,
        error: 'Could not load fish history',
      },
     {
  status: 500,
  headers: corsHeaders,
}
    )
  }
}