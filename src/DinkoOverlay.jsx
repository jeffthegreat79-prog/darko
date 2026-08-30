import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import './DinkoOverlay.css'

const { Engine, Bodies, Composite, Body } = Matter

const slots = [
  { multiplier: '10x', className: 'jackpot' },
  { multiplier: '5x', className: 'high' },
  { multiplier: '3x', className: 'high' },
  { multiplier: '1.5x', className: 'safe' },
  { multiplier: '1x', className: 'safe' },
  { multiplier: '0.8x', className: 'low' },
  { multiplier: '0.5x', className: 'zero' },
  { multiplier: '0.8x', className: 'low' },
  { multiplier: '1x', className: 'safe' },
  { multiplier: '1.5x', className: 'safe' },
  { multiplier: '3x', className: 'high' },
  { multiplier: '5x', className: 'high' },
  { multiplier: '10x', className: 'jackpot' },
]

const pegRows = [ 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12,
]

const BOARD_WIDTH = 900
const BOARD_HEIGHT = 760
const SLOT_WIDTH = BOARD_WIDTH / slots.length
const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default function DinkoOverlay() {
  const [currentPlay, setCurrentPlay] = useState(null)
  const [puckPosition, setPuckPosition] = useState({
    x: BOARD_WIDTH / 2,
    y: 32,
  })
  const [winningSlot, setWinningSlot] = useState(null)

  const busyRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('dinko-overlay-body')

    return () => {
      document.body.classList.remove('dinko-overlay-body')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let pollTimer = null
    let animationFrame = null
    let activeBall = null

    const engine = Engine.create()

    engine.gravity.x = 0
  engine.gravity.y = 0.8
engine.gravity.scale = 0.001
    const world = engine.world

    // Side walls
    Composite.add(world, [
      Bodies.rectangle(
        -15,
        BOARD_HEIGHT / 2,
        30,
        BOARD_HEIGHT,
        { isStatic: true }
      ),

      Bodies.rectangle(
        BOARD_WIDTH + 15,
        BOARD_HEIGHT / 2,
        30,
        BOARD_HEIGHT,
        { isStatic: true }
      ),
    ])

    // Physical pegs matching the visual board.
    pegRows.forEach((count, rowIndex) => {
      const spacing = 76
      const rowWidth = (count - 1) * spacing
      const startX = BOARD_WIDTH / 2 - rowWidth / 2
      const y = 125 + rowIndex * 49

      for (let index = 0; index <= slots.length; index += 1) {
        const x = startX + index * spacing

        const peg = Bodies.circle(x, y, 7, {
          isStatic: true,
          restitution: 0.9,
          friction: 0,
          frictionStatic: 0,
        })

        Composite.add(world, peg)
      }
    })

    // Invisible slot dividers at the bottom.
    for (let index = 0; index <= 9; index += 1) {
      const x = index * SLOT_WIDTH

     const divider = Bodies.rectangle(
  x,
  700,
  4,
  100,
        {
          isStatic: true,
          restitution: 0.35,
          friction: 0,
        }
      )

      Composite.add(world, divider)
    }

    // Bottom floor.
    Composite.add(
      world,
      Bodies.rectangle(
        BOARD_WIDTH / 2,
        755,
        BOARD_WIDTH,
        20,
        {
          isStatic: true,
          restitution: 0.25,
        }
      )
    )

    async function completePlay(playId) {
      if (!playId) return

      try {
        await fetch('/api/dinko/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: playId,
          }),
        })
      } catch (error) {
        console.error('DINKO complete error:', error)
      }
    }

    function removeBall() {
      if (activeBall) {
        Composite.remove(world, activeBall)
        activeBall = null
      }
    }

    function runPhysics(play) {
      return new Promise((resolve) => {
        removeBall()

        const slotIndex = Number(play.slot_index)

        const targetX =
          slotIndex * SLOT_WIDTH + SLOT_WIDTH / 2

        activeBall = Bodies.circle(
          BOARD_WIDTH / 2,
          32,
          17,
          {
            restitution: 0.9,
            friction: 0.001,
            frictionStatic: 0,
           frictionAir: 0.012,
density: 0.002,
          }
        )

        // Tiny randomized starting nudge.
        Body.setVelocity(activeBall, {
          x: (Math.random() - 0.5) * 1.4,
          y: 0,
        })

        Composite.add(world, activeBall)

        let previousTime = performance.now()
        const startedAt = previousTime

        function tick(now) {
          if (cancelled || !activeBall) {
            resolve()
            return
          }

          const delta = Math.min(
            now - previousTime,
            1000 / 30
          )

          previousTime = now

          /*
           * The server already chose the winning slot.
           *
           * Matter.js handles the real collisions, while this
           * very small steering correction gradually biases the
           * puck toward that server-selected result.
           */
          const ballY = activeBall.position.y
          const distanceX =
            targetX - activeBall.position.x

          const lowerBoardStrength =
            Math.max(
              0,
              Math.min(1, (ballY - 250) / 300)
            )

        const desiredVelocityX =
  Math.max(
    -4,
    Math.min(4, distanceX * 0.035)
  )

          const landingGuide =
  ballY > 620 ? 0.14 : 0

const steering =
  0.008 +
  lowerBoardStrength * 0.045 +
  landingGuide
          Body.setVelocity(activeBall, {
            x:
              activeBall.velocity.x *
                (1 - steering) +
              desiredVelocityX * steering,

            y: activeBall.velocity.y,
          })

          Engine.update(engine, delta)

          setPuckPosition({
            x: activeBall.position.x,
            y: activeBall.position.y,
          })


          const timedOut =
            now - startedAt > 9000

          const landed =
            activeBall.position.y > 620 &&
            Math.abs(activeBall.velocity.y) < 2

          if (landed || timedOut) {
            setWinningSlot(slotIndex)

            resolve()
            return
          }

          animationFrame =
            requestAnimationFrame(tick)
        }

        animationFrame =
          requestAnimationFrame(tick)
      })
    }

    async function animatePlay(play) {
      busyRef.current = true

      setCurrentPlay(play)
      setWinningSlot(null)
      setPuckPosition({
        x: BOARD_WIDTH / 2,
        y: 32,
      })

      await wait(400)

      await runPhysics(play)

      await wait(1000)

      await completePlay(play.id)

      await wait(1200)

      removeBall()

      setCurrentPlay(null)
      setWinningSlot(null)

      setPuckPosition({
        x: BOARD_WIDTH / 2,
        y: 32,
      })

      busyRef.current = false
    }

    async function pollForPlay() {
      if (cancelled || busyRef.current) {
        return
      }

      try {
        const response = await fetch(
          '/api/dinko/claim',
          {
            method: 'POST',
          }
        )

        if (!response.ok) {
          throw new Error('DINKO claim failed')
        }

        const data = await response.json()

        if (data.play) {
          await animatePlay(data.play)
        }
      } catch (error) {
        console.error(
          'DINKO overlay poll error:',
          error
        )
      }

      if (!cancelled) {
        pollTimer = setTimeout(
          pollForPlay,
          1500
        )
      }
    }

    function handleLocalDrop(event) {
      if (
        event.code !== 'Space' ||
        busyRef.current
      ) {
        return
      }

      const randomSlot = Math.floor(Math.random() * slots.length)

      animatePlay({
        id: null,
        username: 'LOCAL TEST',
        wager: 100,
        slot_index: randomSlot,
        multiplier:
          slots[randomSlot].multiplier,
        payout: 100,
      })
    }

    if (
      window.location.hostname ===
      'localhost'
    ) {
      window.addEventListener(
        'keydown',
        handleLocalDrop
      )
    } else {
      pollForPlay()
    }

    return () => {
      cancelled = true

      clearTimeout(pollTimer)

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }

      window.removeEventListener(
        'keydown',
        handleLocalDrop
      )

      removeBall()

      Composite.clear(world, false)
      Engine.clear(engine)
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
              left: `${puckPosition.x}px`,
              top: `${puckPosition.y}px`,
            }}
          >
            {currentPlay && (
              <span className="dinko-puck-name">
                {currentPlay.username}
              </span>
            )}
          </div>

          <div className="dinko-pegs">
            {pegRows.map(
              (count, rowIndex) => (
                <div
                  className="dinko-peg-row"
                  key={`row-${rowIndex}`}
                >
                  {Array.from({
                    length: count,
                  }).map((_, pegIndex) => (
                    <span
                      className="dinko-peg"
                      key={`peg-${rowIndex}-${pegIndex}`}
                    />
                  ))}
                </div>
              )
            )}
          </div>

          <div className="dinko-slots">
            {slots.map((slot, index) => (
              <div
                className={`dinko-slot ${slot.className} ${
                  winningSlot === index
                    ? 'winner'
                    : ''
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