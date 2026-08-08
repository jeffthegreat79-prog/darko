const SOUND_SETTING_KEY = 'darko-sound-enabled'

let soundEnabled = localStorage.getItem(SOUND_SETTING_KEY) !== 'false'

export function isSoundEnabled() {
  return soundEnabled
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled
  localStorage.setItem(SOUND_SETTING_KEY, String(enabled))
}
let audioContext = null

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) return null

  if (!audioContext) {
    audioContext = new AudioContextClass()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

function playTone(
  context,
  startFrequency,
  endFrequency,
  delay,
  duration,
  type = 'sine',
  volume = 0.05,
) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()

  const startTime = context.currentTime + delay
  const endTime = startTime + duration

  oscillator.type = type
  oscillator.frequency.setValueAtTime(startFrequency, startTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    endTime,
  )

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.02,
  )
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime,
  )

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)

  oscillator.start(startTime)
  oscillator.stop(endTime + 0.02)
}

export function playSound(soundName) {
  if (!soundEnabled) return
  try {
    const context = getAudioContext()

    if (!context) return

    if (soundName === 'cast') {
      playTone(context, 500, 180, 0, 0.25, 'sine', 0.05)
      playTone(context, 350, 120, 0.08, 0.3, 'triangle', 0.035)
    }

    if (soundName === 'bite') {
      playTone(context, 700, 900, 0, 0.1, 'square', 0.035)
      playTone(context, 900, 1200, 0.13, 0.12, 'square', 0.035)
    }

    if (soundName === 'catch') {
      playTone(context, 523, 523, 0, 0.14, 'triangle', 0.05)
      playTone(context, 659, 659, 0.13, 0.14, 'triangle', 0.05)
      playTone(context, 784, 784, 0.26, 0.22, 'triangle', 0.05)
    }
  } catch (error) {
    console.error('Sound error:', error)
  }
}