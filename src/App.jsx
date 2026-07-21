import { useEffect, useState } from 'react'
import './App.css'

const fishTable = [
  {
    name: 'Bluegill',
    rarity: 'Common',
    value: 12,
    chance: 40,
    icon: '🐟',
  },
  {
    name: 'Yellow Perch',
    rarity: 'Common',
    value: 16,
    chance: 25,
    icon: '🐟',
  },
  {
    name: 'Rainbow Trout',
    rarity: 'Uncommon',
    value: 35,
    chance: 16,
    icon: '🐠',
  },
  {
    name: 'Largemouth Bass',
    rarity: 'Rare',
    value: 85,
    chance: 10,
    icon: '🐟',
  },
  {
    name: 'King Salmon',
    rarity: 'Epic',
    value: 175,
    chance: 6,
    icon: '🐠',
  },
  {
    name: 'Golden Koi',
    rarity: 'Legendary',
    value: 500,
    chance: 2.5,
    icon: '✨',
  },
  {
    name: 'Abyssal Leviathan',
    rarity: 'Mythical',
    value: 2500,
    chance: 0.5,
    icon: '🐉',
  },
]

const defaultPlayer = {
  coins: 0,
  catches: 0,
  inventory: [],
  biggestCatch: null,
}

function getRandomFish() {
  const roll = Math.random() * 100
  let runningTotal = 0

  for (const fish of fishTable) {
    runningTotal += fish.chance

    if (roll <= runningTotal) {
      return fish
    }
  }

  return fishTable[0]
}

function App() {
  const [player, setPlayer] = useState(() => {
    const savedPlayer = localStorage.getItem('darko-player')

    if (!savedPlayer) {
      return defaultPlayer
    }

    try {
      return JSON.parse(savedPlayer)
    } catch {
      return defaultPlayer
    }
  })

  const [catchResult, setCatchResult] = useState(null)
  const [isFishing, setIsFishing] = useState(false)

  useEffect(() => {
    localStorage.setItem('darko-player', JSON.stringify(player))
  }, [player])

  function castLine() {
    if (isFishing) return

    setIsFishing(true)
    setCatchResult(null)

    setTimeout(() => {
      const caughtFish = getRandomFish()
      const weight = Number((Math.random() * 24 + 1).toFixed(1))

      const completedCatch = {
        ...caughtFish,
        weight,
        caughtAt: new Date().toISOString(),
      }

      setCatchResult(completedCatch)

      setPlayer((currentPlayer) => {
        const isBiggestCatch =
          !currentPlayer.biggestCatch ||
          completedCatch.weight > currentPlayer.biggestCatch.weight

        return {
          ...currentPlayer,
          coins: currentPlayer.coins + completedCatch.value,
          catches: currentPlayer.catches + 1,
          inventory: [completedCatch, ...currentPlayer.inventory].slice(0, 25),
          biggestCatch: isBiggestCatch
            ? completedCatch
            : currentPlayer.biggestCatch,
        }
      })

      setIsFishing(false)
    }, 1400)
  }

  function resetProgress() {
    const confirmed = window.confirm(
      'Reset all coins, catches, and inventory?',
    )

    if (!confirmed) return

    setPlayer(defaultPlayer)
    setCatchResult(null)
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

        <div className="nav-links">
          <a href="#game">Game</a>
          <a href="#inventory">Inventory</a>
          <a href="#features">Features</a>
        </div>

        <button className="kick-button" type="button">
          Connect Kick
        </button>
      </nav>

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
            {isFishing && (
              <p className="fishing-message">
                Something is moving beneath the water...
              </p>
            )}

            {catchResult && (
              <div className="catch-card">
                <span className="catch-icon">{catchResult.icon}</span>

                <div>
                  <p>You caught a</p>
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

        <div className="hero-art" aria-hidden="true">
          <div className="moon" />
          <div className="fishing-line" />
          <div className="bobber">
            <span />
          </div>
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

          <article className="feature-card">
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