

import { useState, useEffect, useRef } from 'react'
import './PlinkoPage.css'
import DinkoOverlay from './DinkoOverlay.jsx'

export default function PlinkoPage() {
  const [wager, setWager] = useState('')

const [viewer, setViewer] = useState(null)
const [viewerStatus, setViewerStatus] = useState('loading')

const [dropBusy, setDropBusy] = useState(false)
const [dropError, setDropError] = useState('')
const dropLockRef = useRef(false)

useEffect(() => {
  let active = true

  async function checkViewer() {
    try {
      const response = await fetch('/api/kick/viewer-status', {
        credentials: 'same-origin',
        cache: 'no-store',
      })

      if (!response.ok ||
          !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Viewer status unavailable')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error('Viewer status failed')
      }

      if (!active) return

      setViewer(data.connected ? data.viewer : null)
      setViewerStatus(data.connected ? 'connected' : 'disconnected')
    } catch (error) {
      if (active) setViewerStatus('unavailable')
    }
  }

  checkViewer()

  return () => {
    active = false
  }
}, [])

  const frameRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current
    const stage = stageRef.current

    if (!frame || !stage) return

    function resizeBoard() {
      const fullWidth = 948
      const availableWidth = frame.clientWidth

      if (!availableWidth) return

      const scale = Math.min(
        1,
        availableWidth / fullWidth
      )

      stage.style.transform = `scale(${scale})`

      frame.style.height =
        `${Math.ceil(stage.offsetHeight * scale)}px`
    }

    const observer = new ResizeObserver(resizeBoard)

    observer.observe(frame)
    observer.observe(stage)

    resizeBoard()

    return () => {
      observer.disconnect()
    }
  }, [])

useEffect(() => {

async function handleDropFinished() {
  try {
    const response = await fetch('/api/kick/viewer-status', {
      credentials: 'same-origin',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Balance refresh failed')
    }

    const data = await response.json()

    if (!data.success || !data.connected) {
      throw new Error('Unable to verify balance')
    }

    setViewer(data.viewer)
    setDropError('')

sessionStorage.removeItem('plinkoPendingRequest')

  } catch (error) {
    console.error('Plinko balance refresh:', error)
    setDropError(
      'Could not refresh balance. Reload the page before playing again.'
    )
  } finally {
    dropLockRef.current = false
    setDropBusy(false)
  }
}


function handleDropError() {
  setDropError(
    'The ball animation was interrupted. Your wager is saved. Refresh the page to recover it.'
  )

  dropLockRef.current = false
  setDropBusy(false)
}

  window.addEventListener(
    'plinko:drop-finished',
    handleDropFinished
  )
window.addEventListener(
  'plinko:drop-error',
  handleDropError
)

return () => {
  window.removeEventListener(
    'plinko:drop-finished',
    handleDropFinished
  )

  window.removeEventListener(
    'plinko:drop-error',
    handleDropError
  )
}

}, [])

useEffect(() => {
  if (viewerStatus !== 'connected' || !viewer) {
    return
  }

  const savedRequest = sessionStorage.getItem(
    'plinkoPendingRequest'
  )

  if (!savedRequest) return

  let pending

  try {
    pending = JSON.parse(savedRequest)

    if (
      !pending.requestId ||
      !Number.isSafeInteger(pending.wager)
    ) {
      throw new Error('Invalid saved wager')
    }
  } catch (error) {
    setDropError(
      'Saved wager information is invalid. Please check your balance before playing.'
    )
    return
  }

  if (dropLockRef.current) return

  let cancelled = false

  dropLockRef.current = true
  setDropBusy(true)
  setDropError('Checking your previous Plinko wager...')

  async function recoverPendingWager() {
    try {
      const response = await fetch(
        `/api/dinko/website-result?requestId=${encodeURIComponent(pending.requestId)}`,
        {
          credentials: 'same-origin',
          cache: 'no-store',
        }
      )

      const data = await response.json()

      if (cancelled) return

      if (response.ok && data.success && data.play) {
        setDropError('')

        window.dispatchEvent(
          new CustomEvent('plinko:drop', {
            detail: { play: data.play },
          })
        )

        return
      }

      setDropError(
        'Your previous wager could not be confirmed. Please do not place another wager yet.'
      )
    } catch (error) {
      if (!cancelled) {
        console.error('Plinko recovery failed:', error)

        setDropError(
          'Connection problem while recovering your wager. Please refresh to retry.'
        )
      }
    }

    if (!cancelled) {
      dropLockRef.current = false
      setDropBusy(false)
    }
  }

  recoverPendingWager()

  return () => {
    cancelled = true
  }
}, [viewerStatus, viewer?.username])


async function handleDropBall() {
  if (dropLockRef.current || viewerStatus !== 'connected') {
    return
  }

  const pendingRequest = sessionStorage.getItem(
    'plinkoPendingRequest'
  )

  if (pendingRequest) {
    setDropError(
      'A previous Plinko wager needs to be checked before you can play again.'
    )
    return
  }


  const amount = Number(wager)

  if (
    !/^[0-9]+$/.test(wager) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > Math.floor(Number.MAX_SAFE_INTEGER / 10)
  ) {
    setDropError('Enter a valid coin wager.')
    return
  }

  if (amount > Number(viewer?.coins ?? 0)) {
    setDropError('Not enough coins!')
    return
  }

  dropLockRef.current = true
  setDropBusy(true)
  setDropError('')


const requestId = crypto.randomUUID()

sessionStorage.setItem(
  'plinkoPendingRequest',
  JSON.stringify({
    requestId,
    wager: amount,
  })
)


  try {
    const response = await fetch('/api/dinko/website-drop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        wager: amount,
        requestId,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success || !data.play) {
      throw new Error(data.error || 'Plinko wager failed')
    }


    window.dispatchEvent(
      new CustomEvent('plinko:drop', {
        detail: { play: data.play },
      })
    )

} catch (error) {
  console.error('Plinko wager error:', error)

  // Don't create another wager. Check the original request.
  try {
    const recoveryResponse = await fetch(
      `/api/dinko/website-result?requestId=${encodeURIComponent(requestId)}`,
      {
        credentials: 'same-origin',
        cache: 'no-store',
      }
    )

    const recovery = await recoveryResponse.json()

    if (recoveryResponse.ok && recovery.success && recovery.play) {
      setDropError('')

      window.dispatchEvent(
        new CustomEvent('plinko:drop', {
          detail: { play: recovery.play },
        })
      )

      return
    }

    // A confirmed rejection with no recorded wager.
    if (
      recoveryResponse.status === 404 &&
      recovery.error === 'Wager not found' &&
      error.message === 'Insufficient coins or player not found'
    ) {
      sessionStorage.removeItem('plinkoPendingRequest')
      setDropError(error.message)
      dropLockRef.current = false
      setDropBusy(false)
      return
    }

    // Otherwise, keep the original wager ID for recovery.
    setDropError(
      'Wager status uncertain. Please do not place another bet until this is resolved.'
    )
  } catch (recoveryError) {
    console.error('Plinko recovery error:', recoveryError)

    setDropError(
      'Connection interrupted. Your wager ID has been saved for recovery.'
    )
  }

  dropLockRef.current = false
  setDropBusy(false)
}

}

  return (
    <main className="plinko-page">
      <h1>🎰 DARKOVISION PLINKO</h1>

      <p>Choose your wager and drop a ball!</p>

<div className="plinko-viewer">
  {viewerStatus === 'loading' ? (
    <span>Checking Kick connection...</span>
  ) : viewerStatus === 'connected' ? (
    <>
      <div>✅ Connected as {viewer.username}</div>
      <div>
        🪙 Available Coins: {Number(viewer.coins || 0).toLocaleString()}
      </div>
    </>
  ) : viewerStatus === 'disconnected' ? (
    <a href="/api/kick/viewer-login">
      Connect Kick to play Plinko
    </a>
  ) : (
    <span>Kick connection unavailable in this preview</span>
  )}
</div>


      <div className="plinko-controls">
        <label htmlFor="plinko-wager">
          How many coins do you want to bet?
        </label>

        <input
          id="plinko-wager"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="Enter coin amount"
          value={wager}
          onChange={(e) => setWager(e.target.value)}
        />


<button
  type="button"
  onClick={handleDropBall}
  disabled={
    dropBusy ||
    viewerStatus !== 'connected' ||
    !/^[0-9]+$/.test(wager) ||
    Number(wager) <= 0 ||
    Number(wager) > Number(viewer?.coins ?? 0)
  }
>
  {dropBusy ? '🎰 BALL DROPPING...' : '🎰 DROP BALL'}
</button>

{dropError && (
  <div role="alert" style={{ color: '#fca5a5' }}>
    {dropError}
  </div>
)}

      </div>

      <div
        className="plinko-board-frame"
        ref={frameRef}
      >
        <div
          className="plinko-board-stage"
          ref={stageRef}
        >
          <DinkoOverlay mode="website" />
        </div>
      </div>
    </main>
  )
}
