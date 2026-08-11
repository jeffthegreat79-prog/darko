import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  playSound,
  isSoundEnabled,
  setSoundEnabled,
} from './soundEffects'
const fishTable = [
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
const baits = [
  {
    name: 'Worm',
    cost: 10,
    bonus: 0,
    rareBonus: 0,
    icon: '🪱',
  },
  {
    name: 'Minnow',
    cost: 40,
    bonus: 2,
    rareBonus: 3,
    icon: '🐟',
  },
  {
    name: 'Cricket',
    cost: 75,
    bonus: 4,
    rareBonus: 6,
    icon: '🦗',
  },
  {
    name: 'Golden Lure',
    cost: 200,
    bonus: 8,
    rareBonus: 12,
    icon: '✨',
  },
]
const defaultPlayer = {
  coins: 0,
  catches: 0,
  inventory: [],
  biggestCatch: null,
  ownedRods: [],
  ownedBaits: [],
  rod: null,
  bait: null,
  speciesRecords: {},
}

function App() {
  const [player, setPlayer] = useState(() => {
    const savedPlayer = localStorage.getItem('darko-player')

    if (!savedPlayer) {
      return defaultPlayer
    }

    try {
      return {
  ...defaultPlayer,
  ...JSON.parse(savedPlayer),
}
    } catch {
      return defaultPlayer
    }
  })
const [soundOn, setSoundOn] = useState(() => isSoundEnabled())

useEffect(() => {
  setSoundEnabled(soundOn)
}, [soundOn])
const audioContextRef = useRef(null)
function playTone({
  frequency = 440,
  endFrequency = frequency,
  duration = 0.15,
  type = 'sine',
  volume = 0.08,
  delay = 0,
}) {
  if (!soundOn) return

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) return

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContextClass()
  }

  const audioContext = audioContextRef.current

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  const startTime = audioContext.currentTime + delay
  const endTime = startTime + duration

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    endTime
  )

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.01
  )
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  oscillator.start(startTime)
  oscillator.stop(endTime)
}

function playGameSound(sound) {
  if (sound === 'cast') {
    playTone({
      frequency: 500,
      endFrequency: 130,
      duration: 0.22,
      type: 'triangle',
      volume: 0.06,
    })
  }

  if (sound === 'bite') {
    playTone({
      frequency: 750,
      endFrequency: 950,
      duration: 0.1,
      type: 'square',
      volume: 0.05,
    })

    playTone({
      frequency: 950,
      endFrequency: 1150,
      duration: 0.1,
      type: 'square',
      volume: 0.05,
      delay: 0.12,
    })
  }

  if (sound === 'catch') {
    playTone({
      frequency: 420,
      endFrequency: 650,
      duration: 0.18,
      type: 'triangle',
      volume: 0.07,
    })

    playTone({
      frequency: 650,
      endFrequency: 900,
      duration: 0.2,
      type: 'triangle',
      volume: 0.07,
      delay: 0.16,
    })
  }

  if (sound === 'trophy') {
    playTone({
      frequency: 520,
      endFrequency: 520,
      duration: 0.22,
      type: 'triangle',
      volume: 0.08,
    })

    playTone({
      frequency: 660,
      endFrequency: 660,
      duration: 0.22,
      type: 'triangle',
      volume: 0.08,
      delay: 0.14,
    })

    playTone({
      frequency: 880,
      endFrequency: 1100,
      duration: 0.4,
      type: 'triangle',
      volume: 0.09,
      delay: 0.28,
    })
  }
}
  const [catchResult, setCatchResult] = useState(null)

const [isFishing, setIsFishing] = useState(false)

const [fishingPhase, setFishingPhase] = useState('idle')

const [shopOpen, setShopOpen] = useState(false)
const lastKickCommandId = useRef(null)
const castLineRef = useRef(null)
  useEffect(() => {
    localStorage.setItem('darko-player', JSON.stringify(player))
  }, [player])
function buyRod(rod) {
  if (player.coins < rod.cost) return

  if ((player.ownedRods ?? []).includes(rod.name)) return

  
}
function equipRod(rod) {
  if (!(player.ownedRods ?? []).includes(rod.name)) return

  setPlayer((current) => ({
    ...current,
    rod: rod.name,
  }))
}
function buyBait(bait) {
  if (player.coins < bait.cost) {
    alert("You do not have enough coins!")
    return
  }

  setPlayer((current) => {
    const alreadyOwned = (current.ownedBaits ?? []).includes(bait.name)

    const currentQuantity =
      current.baitCounts?.[bait.name] ?? 0

    return {
      ...current,

      coins: current.coins - bait.cost,

      ownedBaits: alreadyOwned
        ? current.ownedBaits
        : [...(current.ownedBaits ?? []), bait.name],

      baitCounts: {
        ...(current.baitCounts ?? {}),
        [bait.name]: currentQuantity + 5,
      },
    }
  })
}

function equipBait(bait) {
  const quantity = player.baitCounts?.[bait.name] ?? 0

  if (quantity <= 0) return

  setPlayer((current) => ({
    ...current,
    bait: bait.name,
  }))
}
function getRandomFish(rareBonus = 0) {
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

function castLine(kickUsername = null) {
  if (isFishing) return

  playSound('cast')

  setIsFishing(true)
      const equippedBaitName = player.bait

  const baitQuantity = equippedBaitName
    ? player.baitCounts?.[equippedBaitName] ?? 0
    : 0

  if (equippedBaitName && baitQuantity <= 0) {
    alert('You are out of that bait!')

    setPlayer((current) => ({
      ...current,
      bait: null,
    }))

    return
  }

  if (equippedBaitName) {
    setPlayer((current) => {
      const currentQuantity =
        current.baitCounts?.[equippedBaitName] ?? 0

      const nextQuantity = Math.max(0, currentQuantity - 1)

      return {
        ...current,

        baitCounts: {
          ...(current.baitCounts ?? {}),
          [equippedBaitName]: nextQuantity,
        },

        bait: nextQuantity === 0
          ? null
          : current.bait,
      }
    })
  }

    setIsFishing(true)
    setCatchResult(null)
    setFishingPhase('casting')

    setTimeout(() => {
      setFishingPhase('waiting')
    }, 600)

    setTimeout(() => {
  setFishingPhase('bite')
  playSound('bite')
}, 1800)

    setTimeout(() => {
      const equippedBait = baits.find(
  (bait) => bait.name === equippedBaitName
)

const rareBonus = equippedBait?.rareBonus ?? 0

const caughtFish = getRandomFish(rareBonus)

playSound('catch')

const equippedRod = rods.find((rod) => rod.name === player.rod)

const weightCap = equippedRod?.weightCap ?? 0.7

let rodMaxWeight = caughtFish.maxWeight * weightCap

if (equippedRod?.name === 'Legendary Rod' && Math.random() < 0.15) {
  rodMaxWeight = caughtFish.maxWeight * 1.2
}

const weight = Number(
  (
    caughtFish.minWeight +
    Math.random() * (rodMaxWeight - caughtFish.minWeight)
  ).toFixed(1)
)

const trophyThreshold = caughtFish.maxWeight * 0.95

const isTrophy = weight >= trophyThreshold

const weightProgress =
  (weight - caughtFish.minWeight) /
  (caughtFish.maxWeight - caughtFish.minWeight)

const rewardMultiplier = 0.5 + weightProgress * 1.5

const reward = Math.max(
  1,
  Math.round(caughtFish.value * rewardMultiplier)
)

const completedCatch = {
  ...caughtFish,
  weight,
  value: reward,
  isTrophy,
  caughtAt: new Date().toISOString(),
  username: typeof kickUsername === 'string' ? kickUsername : null,
}

      setCatchResult(completedCatch)
      setFishingPhase('caught')

      setPlayer((currentPlayer) => {
  const isBiggestCatch =
    !currentPlayer.biggestCatch ||
    completedCatch.weight > currentPlayer.biggestCatch.weight

  const currentSpeciesRecord =
    currentPlayer.speciesRecords?.[completedCatch.name]

  const isNewSpeciesRecord =
    !currentSpeciesRecord ||
    completedCatch.weight > currentSpeciesRecord.weight

  const updatedSpeciesRecords = {
    ...(currentPlayer.speciesRecords || {}),
  }

  if (isNewSpeciesRecord) {
    updatedSpeciesRecords[completedCatch.name] = completedCatch
  }

  return {
    ...currentPlayer,
    coins: currentPlayer.coins + completedCatch.value,
    catches: currentPlayer.catches + 1,
    inventory: [completedCatch, ...currentPlayer.inventory].slice(0, 25),
    biggestCatch: isBiggestCatch
      ? completedCatch
      : currentPlayer.biggestCatch,
    speciesRecords: updatedSpeciesRecords,
  }
})

      setIsFishing(false)
    }, 2600)
  }
useEffect(() => {
  castLineRef.current = castLine
})
useEffect(() => {
  let initialized = false

  async function checkKickCommand() {
    try {
      const response = await fetch('/api/fish/latest', {
        cache: 'no-store',
      })

      if (!response.ok) return

      const latest = await response.json()

      // On page load, remember the newest command without triggering it.
      if (!initialized) {
        lastKickCommandId.current = latest?.id ?? null
        initialized = true
        return
      }

      // Only react when a NEW command appears.
      if (
        latest?.id &&
        latest.id !== lastKickCommandId.current
      ) {
        lastKickCommandId.current = latest.id

        if (latest.command === '!fish') {
          console.log(
            `🎣 Kick cast triggered by ${latest.username}`
          )

          castLineRef.current?.(latest.username)
        }
      }
    } catch (error) {
      console.error('Kick command check failed:', error)
    }
  }

  checkKickCommand()

  const interval = setInterval(checkKickCommand, 1500)

  return () => clearInterval(interval)
}, [])
  function resetProgress() {
    const confirmed = window.confirm(
      'Reset all coins, catches, and inventory?',
    )

    if (!confirmed) return

    setPlayer(defaultPlayer)
    setCatchResult(null)
    setFishingPhase('idle')
    setIsFishing(false)
    localStorage.removeItem('darko-player')
  }

  return (
    <main className="site-shell">
      <div className="ocean-glow ocean-glow-one" />
      <div className="ocean-glow ocean-glow-two" />

      <nav className="navbar">
        <a className="brand" href="/">
          DARKO<span>.WTF</span>
        </a>
</nav>
        <div className="nav-links">
          <a href="#game">Game</a>
          <a href="#inventory">Inventory</a>
          <a href="#features">Features</a>
        </div>

        <div className="nav-actions">
  <button
  className="sound-button"
  type="button"
  onClick={() => setSoundOn((current) => !current)}
  aria-pressed={soundOn}
>
  {soundOn ? '🔊 Sound On' : '🔇 Sound Off'}
</button>

<button className="kick-button" type="button">
  Connect Kick
</button>
</div>

      <section className="hero" id="game">
        <div className="hero-copy">
          <p className="eyebrow">Interactive stream fishing</p>

          <h1>
            Cast. Catch.
            <span> Conquer the deep.</span>
          </h1>

          <p className="hero-description">
            Collect rare fish, earn coins, break records, and build your
            fishing legacy with the Darko community.
          </p>

          <div className="player-summary">
            <article>
              <span>Coins</span>
              <strong>🪙 {player.coins.toLocaleString()}</strong>
            </article>

            <article>
              <span>Total catches</span>
              <strong>{player.catches}</strong>
            </article>

            <article>
              <span>Biggest catch</span>
              <strong>
                {player.biggestCatch
                  ? `${player.biggestCatch.weight} lb`
                  : 'None yet'}
              </strong>
            </article>
          </div>

          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={castLine}
              disabled={isFishing}
            >
              {isFishing ? 'Waiting for a bite...' : '🎣 Cast a Line'}
            </button>

            <a className="secondary-button" href="#inventory">
              View inventory
            </a>
          </div>

          <div className="catch-display" aria-live="polite">
            {fishingPhase === 'casting' && (
              <p className="fishing-message">Casting your line...</p>
            )}

            {fishingPhase === 'waiting' && (
              <p className="fishing-message">
                The bobber is drifting. Wait for it...
              </p>
            )}

            {fishingPhase === 'bite' && (
              <p className="fishing-message bite-message">
                ❗ Something took the bait!
              </p>
            )}

            {catchResult && (
              <div
                className={`catch-card catch-reveal ${catchResult.rarity.toLowerCase()}-catch`}
              >
                <span className="catch-icon">{catchResult.icon}</span>

               <div>

  <p>You caught a</p>

 {catchResult.isTrophy && (
  <div
    className="trophy-banner new-record-banner"
    key={`${catchResult.name}-${catchResult.weight}`}
  >
    <span className="trophy-star">★</span>

    <div className="trophy-message">
      <span className="trophy-title">NEW RECORD!</span>

      <span className="trophy-details">
        {catchResult.name} • {catchResult.weight} lb
      </span>
    </div>

    <span className="trophy-star">★</span>
  </div>
)}
{catchResult.username && (
  <p className="kick-catcher">
    🎣 {catchResult.username} caught:
  </p>
)}
  <h2>{catchResult.name}</h2>

  <span
    className={`rarity ${catchResult.rarity.toLowerCase()}`}
  >
    {catchResult.rarity}
  </span>

  <strong>{catchResult.weight} lb</strong>
  <strong>+{catchResult.value} coins</strong>

</div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`hero-art fishing-${fishingPhase}`}
          aria-hidden="true"
        >
          <div className="moon" />
          <div className="fishing-line" />

          <div className="bobber">
            <span />
          </div>

          <div className="splash-ring splash-ring-one" />
          <div className="splash-ring splash-ring-two" />
          <div className="bite-alert">!</div>

          <div className="water water-back" />
          <div className="water water-front" />
          <div className="fish-shadow fish-one">➤</div>
          <div className="fish-shadow fish-two">➤</div>
        </div>
      </section>

      <section className="inventory-section" id="inventory">
        <div className="inventory-heading">
          <div>
            <p className="eyebrow">Your collection</p>
            <h2>Recent catches</h2>
          </div>

          {player.catches > 0 && (
            <button
              className="reset-button"
              type="button"
              onClick={resetProgress}
            >
              Reset progress
            </button>
          )}
        </div>

        {player.inventory.length === 0 ? (
          <div className="empty-inventory">
            <span>🎣</span>
            <h3>Your inventory is empty</h3>
            <p>Cast your first line to begin your collection.</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {player.inventory.map((fish, index) => (
              <article
                className="inventory-card"
                key={`${fish.caughtAt}-${index}`}
              >
                <span className="inventory-icon">{fish.icon}</span>

                <div>
                  <span className={`rarity ${fish.rarity.toLowerCase()}`}>
                    {fish.rarity}
                  </span>

                  <h3>{fish.name}</h3>
                  <p>{fish.weight} lb</p>
                  <strong>{fish.value} coins</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
<section className="records-section">
  <div className="section-heading">
    <p className="eyebrow">Personal bests</p>
    <h2>🏆 Species Records</h2>
    <p>Your heaviest catch for every species.</p>
  </div>

  <div className="records-grid">
    {fishTable.map((fish) => {
      const record = player.speciesRecords?.[fish.name]

      return (
        <div
  className={`record-card ${record ? 'has-record' : 'not-caught'}`}
  key={fish.name}
>
          <div className="record-fish">
            <span className="record-icon">{fish.icon}</span>

            <div>
              <h3>{fish.name}</h3>
              <p className={`record-rarity rarity-${fish.rarity.toLowerCase()}`}>
  {fish.rarity}
</p>
            </div>
          </div>

          <div className="record-result">
  {record && <span className="record-label">Personal Best</span>}

  <strong className="record-weight">
    {record ? `${record.weight} lb` : 'Not caught'}
  </strong>
</div>
        </div>
      )
    })}
  </div>
</section>
      <section className="features" id="features">
        <div className="section-heading">
          <p className="eyebrow">Coming next</p>
          <h2>The Darko fishing world is growing.</h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span>🎣</span>
            <h3>Rods and bait</h3>
            <p>Upgrade your equipment to improve rarity and catch weight.</p>
          </article>

          <article
  className="feature-card"
  onClick={() => setShopOpen(true)}
  style={{ cursor: "pointer" }}
>
            <span>🛒</span>
            <h3>Fishing shop</h3>
            <p>Spend your coins on gear, storage, boats, and new locations.</p>
          </article>

          <article className="feature-card">
            <span>🏆</span>
            <h3>Leaderboards</h3>
            <p>Compete for the biggest fish and the largest fortune.</p>
          </article>

          <article className="feature-card">
            <span>💬</span>
            <h3>Kick integration</h3>
            <p>Cast directly from chat while watching the live stream.</p>
          </article>
        </div>
       

                {shopOpen && (
          <div className="feature-card" style={{ marginTop: '2rem' }}>
            <h3>🎣 Fishing Shop</h3>

            <h4>Fishing Rods</h4>

            {rods.map((rod) => (
              <div key={rod.name} style={{ marginBottom: '1rem' }}>
                <strong>{rod.name}</strong> - {rod.cost} coins

                {player.rod === rod.name ? (
                  <span> (Equipped)</span>
                ) : player.ownedRods.includes(rod.name) ? (
                  <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => equipRod(rod)}
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => buyRod(rod)}
                  >
                    Buy
                  </button>
                )}
              </div>
            ))}

            <h4 style={{ marginTop: '2rem' }}>🪱 Bait Shop</h4>

            {baits.map((bait) => {
  const quantity = player.baitCounts?.[bait.name] ?? 0
  const isEquipped = player.bait === bait.name

  return (
    <div
      key={bait.name}
      style={{ marginBottom: '1rem' }}
    >
      <strong>
        {bait.icon} {bait.name}
      </strong>

      <div>
        {bait.cost} coins — 5 pieces
      </div>

      <div>
        Quantity: <strong>{quantity}</strong>
      </div>

      {isEquipped ? (
        <span>Equipped</span>
      ) : quantity > 0 ? (
        <button
          style={{ marginLeft: '1rem' }}
          onClick={() => equipBait(bait)}
        >
          Equip
        </button>
      ) : null}

      <button
        style={{ marginLeft: '1rem' }}
        onClick={() => buyBait(bait)}
      >
        Buy 5
      </button>
    </div>
  )
})}
                    </div>
        )}
      </section>

      <footer>
        <a className="brand" href="/">
          DARKO<span>.WTF</span>
        </a>

        <p>Built for the Darko community.</p>
      </footer>
    </main>
  )
}

export default App