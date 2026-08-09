export async function onRequestPost(context) {
  const { request } = context

  try {
    const body = await request.json()

    console.log('Kick webhook received:')
    console.log(JSON.stringify(body, null, 2))
const message = body.content?.trim().toLowerCase()
const username = body.sender?.username ?? 'Unknown'

console.log('Kick chat message:', body.content)

if (message === '!fish') {
  console.log(`🎣 FISH COMMAND received from ${username}`)
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