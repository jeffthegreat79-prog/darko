export const fishTable = [
  {
  name: 'Bluegill',
  rarity: 'Common',
  value: 12,
  chance: 40,
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
  rarity: 'Junk',
  value: 8,
  chance: 4,
  minWeight: .7,
  maxWeight: .8,
  icon: '🎣',
},
{
  name: 'Old Subaru Wiring Harness',
  rarity: 'Junk',
  value: 25,
  chance: 4,
  minWeight: 2.0,
  maxWeight: 7.5,
  icon: '🔌',
},
{
  name: 'Styrofoam cup',
  rarity: 'Junk',
  value: 3,
  chance: 6,
  minWeight: 0.1,
  maxWeight: 0.2,
  icon: '🥤',
},
{
  name: 'Waterlogged worthless Pokémon Card',
  rarity: 'Junk',
  value: 100,
  chance: 2,
  minWeight: 0.01,
  maxWeight: 0.05,
  icon: '🃏',
},
{
  name: 'Old Vape',
  rarity: 'Junk',
  value: 3,
  chance: 6,
  minWeight: 0.1,
  maxWeight: 0.4,
  icon: '🪫',
},
{
  name: 'Waterlogged Pokémon Card',
  rarity: 'Junk',
  value: 50,
  chance: 2,
  minWeight: 0.01,
  maxWeight: 0.05,
  icon: '🃏',
},
{
  name: 'Rusty Taurus 9mm',
  rarity: 'Legendary',
  value: 500,
  chance: .5,
  minWeight: 2.0,
  maxWeight: 2.5,
  icon: '🔫'
}
]
export const RODS = {
  "Grandpa's old Rod": {
    weightCap: 0.7,
  },

  'Fiberglass Rod': {
    weightCap: 0.85,
  },

  'Carbon Rod': {
    weightCap: 1,
  },

  'Legendary Rod': {
    weightCap: 1.1,
    legendary: true,
  },
}

export const BAITS = {
  Worm: {
    rareBonus: 0,
  },

  Minnow: {
    rareBonus: 3,
  },

  Cricket: {
    rareBonus: 6,
  },

  'Golden Lure': {
    rareBonus: 12,
  },
}
export function getRandomFish(rareBonus = 0) {
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
export function createCatch(
  fish,
  {
    weightCap = 0.7,
    legendaryRod = false,
  } = {}
) {
  let rodMaxWeight = fish.maxWeight * weightCap

  if (legendaryRod && Math.random() < 0.15) {
    rodMaxWeight = fish.maxWeight * 1.2
  }

  const weight = Number(
    (
      fish.minWeight +
      Math.random() * (rodMaxWeight - fish.minWeight)
    ).toFixed(1)
  )

  const trophyThreshold = fish.maxWeight * 0.95
  const isTrophy = weight >= trophyThreshold

  const weightRange = fish.maxWeight - fish.minWeight

  const weightProgress =
    weightRange > 0
      ? (weight - fish.minWeight) / weightRange
      : 0

  const rewardMultiplier = 0.5 + weightProgress * 1.5

  const coins = Math.max(
    1,
    Math.round(fish.value * rewardMultiplier)
  )

  return {
    ...fish,
    weight,
    coins,
    isTrophy,
  }
}