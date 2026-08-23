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

   const claimedCommand = await env.FISH_DB
  .prepare(`
    UPDATE fish_commands
    SET claimed_at = ?
    WHERE id = ?
      AND claimed_at IS NULL
    RETURNING
      id,
      username,
      command,
      catch_name,
      catch_rarity,
      catch_weight,
      catch_coins,
      catch_icon,
      catch_is_trophy
  `)
  .bind(claimedAt, commandId)
  .first()

const claimed = Boolean(claimedCommand)

   return Response.json(
  {
    success: true,
    claimed,
    catch: claimedCommand
      ? {
          name: claimedCommand.catch_name,
          rarity: claimedCommand.catch_rarity,
          weight: Number(claimedCommand.catch_weight),
          coins: Number(claimedCommand.catch_coins),
          icon: claimedCommand.catch_icon,
          isTrophy: Number(claimedCommand.catch_is_trophy) === 1,
        }
      : null,
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