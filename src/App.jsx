import { useState } from 'react'
import './App.css'

const fish = [
  { name: 'Bluegill', rarity: 'Common', value: 12 },
  { name: 'Rainbow Trout', rarity: 'Uncommon', value: 35 },
  { name: 'Largemouth Bass', rarity: 'Rare', value: 85 },
  { name: 'Golden Koi', rarity: 'Legendary', value: 500 },
]

function App() {
  const [catchResult, setCatchResult] = useState(null)
  const [isFishing, setIsFishing] = useState(false)

  function castLine() {
    if (isFishing) return

    setIsFishing(true)
    setCatchResult(null)

    setTimeout(() => {
      const randomFish = fish[Math.floor(Math.random() * fish.length)]
      setCatchResult(randomFish)
      setIsFishing(false)
    }, 1400)
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
          <a href="#features">Features</a>
          <a href="#leaderboard">Leaderboard</a>
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
            Fish with the Darko community, collect rare catches, upgrade your
            gear, earn coins, and compete for the top spot.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={castLine}
              disabled={isFishing}
            >
              {isFishing ? 'Waiting for a bite...' : '🎣 Cast a Line'}
            </button>

            <a className="secondary-button" href="#features">
              Explore the game
            </a>
          </div>

          <div className="catch-display" aria-live="polite">
            {isFishing && <p className="fishing-message">Something is moving beneath the water...</p>}

            {catchResult && (
              <div className="catch-card">
                <span className="catch-icon">🐟</span>
                <div>
                  <p>You caught a</p>
                  <h2>{catchResult.name}</h2>
                  <span className={`rarity ${catchResult.rarity.toLowerCase()}`}>
                    {catchResult.rarity}
                  </span>
                  <strong>{catchResult.value} coins</strong>
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

      <section className="stats">
        <article>
          <span>Players</span>
          <strong>1,284</strong>
        </article>
        <article>
          <span>Fish caught</span>
          <strong>48,921</strong>
        </article>
        <article>
          <span>Species</span>
          <strong>120+</strong>
        </article>
        <article>
          <span>Biggest catch</span>
          <strong>892 lb</strong>
        </article>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <p className="eyebrow">Built for the stream</p>
          <h2>Your fishing journey starts here.</h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span>🎣</span>
            <h3>Catch rare fish</h3>
            <p>Discover common, rare, epic, legendary, and mythical catches.</p>
          </article>

          <article className="feature-card">
            <span>🪙</span>
            <h3>Build your fortune</h3>
            <p>Sell your catch, earn coins, and grow your fishing empire.</p>
          </article>

          <article className="feature-card">
            <span>⚓</span>
            <h3>Upgrade your gear</h3>
            <p>Unlock better rods, bait, storage, boats, and fishing locations.</p>
          </article>

          <article className="feature-card" id="leaderboard">
            <span>🏆</span>
            <h3>Rule the leaderboard</h3>
            <p>Compete with the Darko community for records and bragging rights.</p>
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