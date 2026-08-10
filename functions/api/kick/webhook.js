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
      console.log(`🎣 FISH COMMAND received from ${username}`)

      await env.FISH_DB
        .prepare(`
          INSERT OR IGNORE INTO fish_commands
          (kick_message_id, username, command)
          VALUES (?, ?, ?)
        `)
        .bind(kickMessageId, username, message)
        .run()

      console.log(`🎣 Saved !fish command for ${username}`)
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