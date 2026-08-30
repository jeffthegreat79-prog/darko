import { useEffect, useRef, useState } from 'react'
import './DinkoOverlay.css'

const slots = [
  { multiplier: '5x', className: 'jackpot' },
  { multiplier: '2x', className: 'high' },
  { multiplier: '1x', className: 'safe' },
  { multiplier: '0.5x', className: 'low' },
  { multiplier: '0x', className: 'zero' },
  { multiplier: '0.5x', className: 'low' },
  { multiplier: '1x', className: 'safe' },
  { multiplier: '2x', className: 'high' },
  { multiplier: '5x', className: 'jackpot' },
]

const pegRows = [2, 3, 4, 5, 6, 7, 8, 9]

const START_POSITION = {
  x: 50,
  y: 8,
}

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function buildPuckPath(slotIndex) {
  const step = 100 / 18

  const directions = shuffle([
    ...Array(slotIndex).fill(1),
    ...Array(8 - slotIndex).fill(-1),
  ])

  const path = [
    {
      x: 50,
      y: 16,
    },
  ]

  let x = 50

  directions.forEach((direction, index) => {
    x += direction * step

    path.push({
      x,
      y: 24 + index * 8,
    })
  })

  const targetX =
    ((slotIndex + 0.5) / slots.length) * 100

  path.push({
    x: targetX,
    y: 91,
  })

  return path
}

export default function DinkoOverlay() {
  const [currentPlay, setCurrentPlay] = useState(null)

  const [puckPosition, setPuckPosition] =
    useState(START_POSITION)

  const [winningSlot, setWinningSlot] =
    useState(null)

  const busyRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('dinko-overlay-body')

    return () => {
      document.body.classList.remove('dinko-overlay-body')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let pollTimer

    async function completePlay(playId) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch('/api/dinko/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: playId,
            }),
          })

          if (response.ok) {
            return
          }
        } catch (error) {
          console.error('DINKO complete error:', error)
        }

        await wait(500)
      }
    }

    async function animatePlay(play) {
      busyRef.current = true

      setCurrentPlay(play)
      setWinningSlot(null)
      setPuckPosition(START_POSITION)

      await wait(500)

      const path = buildPuckPath(
        Number(play.slot_index)
      )

      for (const point of path) {
        if (cancelled) return

        setPuckPosition(point)
        await wait(340)
      }

      setWinningSlot(Number(play.slot_index))

      await wait(900)

      await completePlay(play.id)

      await wait(1200)

      if (cancelled) return

      setCurrentPlay(null)
      setWinningSlot(null)
      setPuckPosition(START_POSITION)

      busyRef.current = false
    }

    async function pollForPlay() {
      if (cancelled || busyRef.current) {
        return
      }

      try {
        const response = await fetch('/api/dinko/claim', {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('DINKO claim failed')
        }

        const data = await response.json()

        if (data.play) {
          await animatePlay(data.play)
        }
      } catch (error) {
        console.error('DINKO overlay poll error:', error)
      }

      if (!cancelled) {
        pollTimer = setTimeout(pollForPlay, 1500)
      }
    }

    pollForPlay()

    return () => {
      cancelled = true
      clearTimeout(pollTimer)
    }
  }, [])

  return (
    <main className="dinko-overlay">
      <section className="dinko-board">

        <div className="dinko-header">
          <h1>DINKO</h1>
          <p>DROP ZONE</p>
        </div>

        <div className="dinko-playfield">

          <div className="dinko-drop-zone" />

          <div
            className={`dinko-puck ${
              currentPlay ? 'active' : 'idle'
            }`}
            style={{
              left: `${puckPosition.x}%`,
              top: `${puckPosition.y}%`,
            }}
          >
            {currentPlay && (
              <span className="dinko-puck-name">
                {currentPlay.username}
              </span>
            )}
          </div>

          <div className="dinko-pegs">
            {pegRows.map((count, rowIndex) => (
              <div
                className="dinko-peg-row"
                key={`row-${rowIndex}`}
              >
                {Array.from({ length: count }).map(
                  (_, pegIndex) => (
                    <span
                      className="dinko-peg"
                      key={`peg-${rowIndex}-${pegIndex}`}
                    />
                  ),
                )}
              </div>
            ))}
          </div>

          <div className="dinko-slots">
            {slots.map((slot, index) => (
              <div
                className={`dinko-slot ${slot.className} ${
                  winningSlot === index ? 'winner' : ''
                }`}
                key={index}
              >
                {slot.multiplier}
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  )
}