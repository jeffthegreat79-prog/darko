
function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim())

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split('=')

    if (key === name) {
      return valueParts.join('=')
    }
  }

  return null
}
const fishTable = [
  {
  name: 'Bluegill',
  rarity: 'Common',
  value: 12,
  chance: 25,
  minWeight: 0.2,
  maxWeight: 2.5,
  icon: '🐟',
},
  {
    name: 'Yellow Perch',
    rarity: 'Common',
    value: 16,
    chance: 25,
    minWeight: 0.2,
    maxWeight: 3.5,
    icon: '🐟',
},
  {
    name: 'German Brown Trout',
    rarity: 'Uncommon',
    value: 95,
    chance: 8,
    minWeight: 0.6,
    maxWeight: 4.0,
    icon: '🐠',
},
  {
    name: 'Rainbow Trout',
    rarity: 'Uncommon',
    value: 35,
    chance: 16,
    minWeight: 0.6,
    maxWeight: 4.0,
    icon: '🐠',
},
  {
    name: 'Smallmouth Bass',
    rarity: 'Uncommon',
    value: 35,
    chance: 16,
    minWeight: 0.6,
    maxWeight: 4.0,
    icon: '🐠',
},
{
  name: 'Rock Bass',
  rarity: 'Uncommon',
  value: 30,
  chance: 18,
  minWeight: 0.4,
  maxWeight: 3.0,
  icon: '🐟',
},
{
  name: 'Brook Trout',
  rarity: 'Uncommon',
  value: 40,
  chance: 14,
  minWeight: 0.5,
  maxWeight: 6.5,
  icon: '🐟',
},
{
  name: 'Walleye',
  rarity: 'Rare',
  value: 65,
  chance: 10,
  minWeight: 1.0,
  maxWeight: 15.0,
  icon: '🐟',
},
{
  name: 'Striped Bass',
  rarity: 'Rare',
  value: 85,
  chance: 8,
  minWeight: 2.0,
  maxWeight: 50.0,
  icon: '🐟',
},
{
  name: 'Northern Pike',
  rarity: 'Rare',
  value: 95,
  chance: 7,
  minWeight: 2.0,
  maxWeight: 35.0,
  icon: '🐟',
},
{
  name: 'Steelhead Trout',
  rarity: 'Rare',
  value: 110,
  chance: 6,
  minWeight: 3.0,
  maxWeight: 30.0,
  icon: '🐟',
},
{
  name: 'Coho Salmon',
  rarity: 'Rare',
  value: 125,
  chance: 5,
  minWeight: 3.0,
  maxWeight: 35.0,
  icon: '🐟',
},
{
  name: 'Blue Catfish',
  rarity: 'Epic',
  value: 160,
  chance: 4,
  minWeight: 5.0,
  maxWeight: 100.0,
  icon: '🐟',
},
{
  name: 'Tarpon',
  rarity: 'Epic',
  value: 200,
  chance: 3,
  minWeight: 10.0,
  maxWeight: 200.0,
  icon: '🐟',
},
{
  name: 'Alligator Gar',
  rarity: 'Legendary',
  value: 275,
  chance: 2,
  minWeight: 15.0,
  maxWeight: 250.0,
  icon: '🐟',
},
{
  name: 'Sturgeon',
  rarity: 'Legendary',
  value: 350,
  chance: 1.5,
  minWeight: 20.0,
  maxWeight: 500.0,
  icon: '🐟',
},
  {
    name: 'Largemouth Bass',
    rarity: 'Rare',
    value: 85,
    chance: 10,
    minWeight: 2.0,
    maxWeight: 10.0,
    icon: '🐟',
},
  {
    name: 'King Salmon',
    rarity: 'Epic',
    value: 175,
    chance: 6,
    minWeight: 3.0,
    maxWeight: 15.0,
    icon: '🐠',
  },
  {
    name: 'Golden Koi',
    rarity: 'Legendary',
    value: 500,
    chance: 2.5,
    minWeight: 0.6,
    maxWeight: 4.0,
    icon: '✨',
  },
  {
    name: 'Abyssal Leviathan',
    rarity: 'Mythical',
    value: 2500,
    chance: 0.5,
    minWeight: 0.2,
    maxWeight: 2.5,
    icon: '🐉',
  },
  {
   name: 'Baby shark',
   rarity: 'Legendary',
   value: 40,
   chance: 6,
   minWeight: .5,
   maxWeight: 5.0,
   icon: '🦈',
},
 {
    name: 'Channel Catfish',
    rarity: 'Epic',
    value: 75,
    chance: 10,
    minWeight: 1.5,
    maxWeight: 10,
    icon: '🐉',
  },
  {
    name: 'Tiger Musky',
    rarity: 'Rare',
    value: 100,
    chance: 5,
    minWeight: 5.0,
    maxWeight: 10.0,
    icon: '🦈',
    },
   {
    name: 'Crappie',
    rarity: 'Uncommon',
    value: 25,
    chance: 15,
    minWeight: .4,
    maxWeight: 1.5,
    icon: '🐠',
 },
   {
    name: 'Abyssal Leviathan',
    rarity: 'Mythical',
    value: 2500,
    chance: 0.5,
    minWeight: 0.2,
    maxWeight: 2.5,
    icon: '🐉',
  },
  {
  name: 'Old broken fishing rod',
  type: 'junk',
  value: 8,
  chance: 4,
  minWeight: .7,
  maxWeight: .8,
  icon: '🎣',
},
{
  name: 'Old Subaru Wiring Harness',
  type: 'junk',
  value: 25,
  chance: 4,
  minWeight: 2.0,
  maxWeight: 7.5,
  icon: '🔌',
},
{
  name: 'Styrofoam cup',
  type: 'junk',
  value: 3,
  chance: 6,
  minWeight: 0.1,
  maxWeight: 0.2,
  icon: '🥤',
},
{
  name: 'Graded pristine Pokémon Card',
  type: 'treasure',
  rarity: 'Legendary',
  value: 100,
  chance: 2,
  minWeight: 0.01,
  maxWeight: 0.05,
  icon: '🃏',
},
{
  name: 'Old Vape',
  type: 'junk',
  value: 3,
  chance: 6,
  minWeight: 0.1,
  maxWeight: 0.4,
  icon: '🪫',
},
{
  name: 'Rusty Taurus 9mm',
  type: 'treasure',
  rarity: 'Legendary',
  value: 500,
  chance: .5,
  minWeight: 2.0,
  maxWeight: 2.5,
  icon: '🔫'
}
];
const rods = [
  {
    name: "Grandpa's old Rod",
    cost: 0,
    bonus: 0,
    weightCap: 0.7,
  },
  {
    name: 'Fiberglass Rod',
    cost: 150,
    bonus: 3,
    weightCap: 0.85,
  },
  {
    name: 'Carbon Rod',
    cost: 500,
    bonus: 7,
    weightCap: 1,
  },
  {
    name: 'Legendary Rod',
    cost: 1500,
    bonus: 12,
    weightCap: 1.1,
  },
]
;

function rollWebsiteFish(rareBonus = 0) {
  const rarityBoostLevel = {
    Common: 0,
    Uncommon: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4,
    Mythical: 5,
  }

  const weightedFish = fishTable.map((fish) => {
    const boostLevel = rarityBoostLevel[fish.rarity] ?? 0

    const multiplier =
      1 + (rareBonus * boostLevel) / 100

    return {
      fish,
      adjustedChance: fish.chance * multiplier,
    }
  })

  const totalChance = weightedFish.reduce(
    (total, entry) => total + entry.adjustedChance,
    0
  )

  let roll = Math.random() * totalChance

  for (const entry of weightedFish) {
    roll -= entry.adjustedChance

    if (roll <= 0) {
      return entry.fish
    }
  }

  return fishTable[0]
}

const websiteRods = [
  {
    name: "Grandpa's old Rod",
    bonus: 0,
    weightCap: 0.7,
  },
  {
    name: 'Fiberglass Rod',
    bonus: 3,
    weightCap: 0.85,
  },
  {
    name: 'Carbon Rod',
    bonus: 7,
    weightCap: 1,
  },
  {
    name: 'Legendary Rod',
    bonus: 12,
    weightCap: 1.1,
  },
]

const websiteBaits = [
  {
    name: 'Worm',
    bonus: 0,
    rareBonus: 0,
  },
  {
    name: 'Minnow',
    bonus: 2,
    rareBonus: 3,
  },
  {
    name: 'Cricket',
    bonus: 4,
    rareBonus: 6,
  },
  {
    name: 'Golden Lure',
    bonus: 8,
    rareBonus: 12,
  },
]

function calculateWebsiteCatch(rod, bait) {
  const fish = rollWebsiteFish(bait?.rareBonus ?? 0)

  const minWeight = Number(fish.minWeight)
  const maxWeight = Number(fish.maxWeight)
  const weightCap = Number(rod?.weightCap ?? 0.7)

  let rodMaxWeight = Math.max(
    minWeight,
    maxWeight * weightCap
  )

  // Legendary Rod has a 15% chance of extra weight.
  if (
    rod?.name === 'Legendary Rod' &&
    Math.random() < 0.15
  ) {
    rodMaxWeight = maxWeight * 1.2
  }

  const weight = Number(
    (
      minWeight +
      Math.random() * (rodMaxWeight - minWeight)
    ).toFixed(1)
  )

  const isActualFish =
    !fish.type || fish.type === 'fish'

  const isTrophy =
    isActualFish && weight >= maxWeight * 0.95

  const weightRange = maxWeight - minWeight

  const weightProgress =
    weightRange > 0
      ? (weight - minWeight) / weightRange
      : 0

  const rewardMultiplier =
    0.5 + weightProgress * 1.5

  const coins = Math.max(
    1,
    Math.round(fish.value * rewardMultiplier)
  )

  return {
    name: fish.name,
    rarity: fish.rarity ?? 'Common',
    type: fish.type ?? 'fish',
    icon: fish.icon,
    weight,
    coins,
    isTrophy,
  }
}


async function saveWebsiteCatch(env, session, websiteCatch, equippedBait) {
  const now = Math.floor(Date.now() / 1000)
  const castToken = crypto.randomUUID()
  const baitName = equippedBait?.name ?? null
  const username = session.username
  const kickUserId = session.kick_user_id

  const recordWeight =
    websiteCatch.type === 'fish' ? websiteCatch.weight : 0

  const recordSpecies =
    websiteCatch.type === 'fish' ? websiteCatch.name : ''

  const db = env.FISH_DB

  // Reserve the cast if cooldown and bait checks pass.
  const reserveCast = db.prepare(`
    INSERT INTO website_cast_cooldowns (
      kick_user_id, last_cast_at, last_cast_token
    )
    SELECT ?, ?, ?
    WHERE (
      ? IS NULL OR EXISTS (
        SELECT 1 FROM player_items
        WHERE username = ? COLLATE NOCASE
          AND item_type = 'bait'
          AND item_name = ?
          AND quantity > 0
      )
    )
    ON CONFLICT(kick_user_id) DO UPDATE SET
      last_cast_at = excluded.last_cast_at,
      last_cast_token = excluded.last_cast_token
    WHERE website_cast_cooldowns.last_cast_at <= ?
  `).bind(
    kickUserId, now, castToken,
    baitName, username, baitName,
    now - 180
  )

  const statements = [reserveCast]

  // Deduct bait only for a successfully reserved cast.
  if (baitName) {
    statements.push(
      db.prepare(`
        UPDATE player_items
        SET quantity = quantity - 1
        WHERE username = ? COLLATE NOCASE
          AND item_type = 'bait'
          AND item_name = ?
          AND quantity > 0
          AND EXISTS (
            SELECT 1 FROM website_cast_cooldowns
            WHERE kick_user_id = ?
              AND last_cast_token = ?
          )
      `).bind(username, baitName, kickUserId, castToken)
    )
  }

  // Award coins only if the preceding operation succeeded.
  const awardCoins = db.prepare(`
    INSERT INTO players (
      username, coins, catches,
      biggest_weight, biggest_species
    )
    SELECT ?, ?, 1, ?, ?
    WHERE EXISTS (
      SELECT 1 FROM website_cast_cooldowns
      WHERE kick_user_id = ?
        AND last_cast_token = ?
    )
    AND changes() = 1

    ON CONFLICT(username) DO UPDATE SET
      coins = players.coins + excluded.coins,
      catches = players.catches + 1,
      biggest_weight = CASE
        WHEN excluded.biggest_weight > players.biggest_weight
        THEN excluded.biggest_weight
        ELSE players.biggest_weight
      END,
      biggest_species = CASE
        WHEN excluded.biggest_weight > players.biggest_weight
        THEN excluded.biggest_species
        ELSE players.biggest_species
      END,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    username,
    websiteCatch.coins,
    recordWeight,
    recordSpecies,
    kickUserId,
    castToken
  )

  statements.push(awardCoins)

  const results = await db.batch(statements)
  const payout = results[results.length - 1]

  return Number(payout?.meta?.changes ?? 0) === 1
}


export async function onRequestPost({ request, env }) {
  try {
    // Reject requests originating from other websites.
    const origin = request.headers.get('Origin')
    const requestOrigin = new URL(request.url).origin

    if (origin && origin !== requestOrigin) {
      return Response.json(
        { success: false, error: 'Invalid origin' },
        { status: 403 }
      )
    }

    // Identify the viewer through their Kick session.
    const sessionId = getCookie(request, 'kick_viewer_session')

    if (!sessionId) {
      return Response.json(
        { success: false, error: 'Connect Kick to fish' },
        { status: 401 }
      )
    }

    const session = await env.FISH_DB
      .prepare(`
        SELECT kick_user_id, username, expires_at
        FROM kick_viewer_sessions
        WHERE session_id = ?
      `)
      .bind(sessionId)
      .first()

    if (
      !session ||
      Number(session.expires_at) <= Date.now()
    ) {
      return Response.json(
        { success: false, error: 'Kick session expired' },
        { status: 401 }
      )
    }

    // Load the player's equipped gear from D1.
    const loadout = await env.FISH_DB
      .prepare(`
        SELECT equipped_rod, equipped_bait
        FROM player_loadout
        WHERE username = ? COLLATE NOCASE
      `)
      .bind(session.username)
      .first()

    const equippedRod =
      websiteRods.find(
        (rod) => rod.name === loadout?.equipped_rod
      ) ?? websiteRods[0]

    const equippedBait =
      websiteBaits.find(
        (bait) => bait.name === loadout?.equipped_bait
      ) ?? null

    // Make sure the equipped rod is owned.
    if (equippedRod.name !== websiteRods[0].name) {
      const ownedRod = await env.FISH_DB
        .prepare(`
          SELECT quantity
          FROM player_items
          WHERE username = ? COLLATE NOCASE
            AND item_type = 'rod'
            AND item_name = ?
        `)
        .bind(session.username, equippedRod.name)
        .first()

      if (Number(ownedRod?.quantity ?? 0) < 1) {
        return Response.json(
          { success: false, error: 'Equipped rod not owned' },
          { status: 400 }
        )
      }
    }

    // Reject invalid equipped bait.
    if (loadout?.equipped_bait && !equippedBait) {
      return Response.json(
        { success: false, error: 'Invalid equipped bait' },
        { status: 400 }
      )
    }

    // Check available bait quantity.
    if (equippedBait) {
      const baitInventory = await env.FISH_DB
        .prepare(`
          SELECT quantity
          FROM player_items
          WHERE username = ? COLLATE NOCASE
            AND item_type = 'bait'
            AND item_name = ?
        `)
        .bind(session.username, equippedBait.name)
        .first()

      if (Number(baitInventory?.quantity ?? 0) < 1) {
        return Response.json(
          { success: false, error: 'You are out of bait!' },
          { status: 400 }
        )
      }
    }

    // Authentication complete.
    // Fishing rewards will be added next.

    // Generate a catch using verified equipment.
    const websiteCatch = calculateWebsiteCatch(
      equippedRod,
      equippedBait
    )


    // Save the catch, enforce cooldown, and award coins.
    const saved = await saveWebsiteCatch(
      env,
      session,
      websiteCatch,
      equippedBait
    )

    if (!saved) {
      return Response.json(
        {
          success: false,
          error: 'Cast unavailable. You may be on cooldown or out of bait.'
        },
        { status: 429 }
      )
    }

    return Response.json({
      success: true,
      connected: true,
      username: session.username,
      catch: websiteCatch,
      coinsAwarded: websiteCatch.coins
    })



  } catch (error) {
    console.error('Website fishing error:', error)

    return Response.json(
      { success: false, error: 'Website fishing failed' },
      { status: 500 }
    )
  }
}
