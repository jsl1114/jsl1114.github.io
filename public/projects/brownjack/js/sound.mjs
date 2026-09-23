// sound.mjs — synthesized sound effects and vibration, with the player's
// on/off preferences. Everything is generated with the Web Audio API, so there
// are no audio files; outside a browser (or with no audio) every call is a no-op.

const SETTINGS_KEY = 'brownjack.settings.v1'
const DEFAULTS = { sound: true, haptics: true }
const VOLUME = 0.22

let settings = loadSettings()
let audio = null

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(globalThis.localStorage?.getItem(SETTINGS_KEY) ?? '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export const getSettings = () => ({ ...settings })

export function setSetting(key, value) {
  settings = { ...settings, [key]: value }
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Not persisted, but the choice still holds for this visit.
  }
  return getSettings()
}

export const canVibrate = () => typeof globalThis.navigator?.vibrate === 'function'

// Browsers only allow audio after a user gesture; every sound here follows one.
function context() {
  if (!settings.sound) return null
  const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext
  if (!AudioContext) return null
  audio ??= new AudioContext()
  if (audio.state === 'suspended') audio.resume()
  return audio
}

function tone(ctx, { freq, at = 0, length = 0.18, type = 'triangle', gain = 1, slideTo }) {
  const start = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + length)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(VOLUME * gain, start + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(amp).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length + 0.02)
}

// A short burst of filtered noise: the snap of a card on felt.
function snap(ctx, { at = 0, length = 0.06, freq = 2400, gain = 0.9 } = {}) {
  const start = ctx.currentTime + at
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  const amp = ctx.createGain()
  amp.gain.value = VOLUME * gain
  source.connect(filter).connect(amp).connect(ctx.destination)
  source.start(start)
}

const arpeggio = (ctx, notes, { step = 0.09, length = 0.3, type = 'triangle', gain = 0.8, at = 0 } = {}) =>
  notes.forEach((freq, i) => tone(ctx, { freq, at: at + i * step, length, type, gain }))

// Notes (Hz) for the stings.
const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568, C7 = 2093

const SOUNDS = {
  deal: (ctx, at) => snap(ctx, { at }),
  flip: (ctx) => snap(ctx, { length: 0.12, freq: 1200, gain: 0.7 }),
  win: (ctx) => arpeggio(ctx, [C5, G5], { step: 0.1 }),
  blackjack: (ctx) => arpeggio(ctx, [C5, E5, G5, C6], { step: 0.08, length: 0.4 }),
  push: (ctx) => tone(ctx, { freq: 440, length: 0.25, gain: 0.6 }),
  lose: (ctx) => tone(ctx, { freq: 330, slideTo: 220, length: 0.35, gain: 0.7 }),
  bust: (ctx) => {
    tone(ctx, { freq: 220, slideTo: 110, length: 0.45, type: 'sawtooth', gain: 0.35 })
    snap(ctx, { freq: 300, length: 0.15, gain: 0.8 })
  },
  // Badges get grander with rarity.
  common: (ctx) => arpeggio(ctx, [E6, G6], { step: 0.07, length: 0.25, type: 'sine' }),
  rare: (ctx) => arpeggio(ctx, [C6, E6, G6], { step: 0.07, length: 0.35, type: 'sine' }),
  epic: (ctx) => arpeggio(ctx, [G5, C6, E6, G6, C7], { step: 0.07, length: 0.45, type: 'sine' }),
  legendary: (ctx) => {
    arpeggio(ctx, [C5, E5, G5, C6, E6, G6, C7], { step: 0.08, length: 0.6, type: 'sine' })
    arpeggio(ctx, [C5, G5, C6], { at: 0.6, step: 0, length: 1.2, gain: 0.6 })
  },
  // Rank-ups: a step up a division, or a fanfare timed to the coin landing.
  division: (ctx) => arpeggio(ctx, [G5, C6], { at: 1.2, step: 0.1, length: 0.4 }),
  tier: (ctx) => {
    arpeggio(ctx, [C6, C6, C6], { at: 0.35, step: 0.3, length: 0.08, type: 'square', gain: 0.25 })
    arpeggio(ctx, [C5, E5, G5, C6], { at: 2.45, step: 0, length: 1, gain: 0.7 })
  },
}

export function play(name, { at = 0 } = {}) {
  try {
    const ctx = context()
    if (ctx) SOUNDS[name]?.(ctx, at)
  } catch {
    // Sound is decoration; never let it break the game.
  }
}

const PATTERNS = {
  bust: [40, 40, 40],
  blackjack: [20, 40, 20, 40, 60],
  win: [25],
  badge: [30, 60, 30],
  rankUp: [30, 60, 30, 60, 120],
}

export function buzz(name) {
  if (!settings.haptics || !canVibrate()) return
  try {
    globalThis.navigator.vibrate(PATTERNS[name])
  } catch {
    // Some browsers refuse without a recent gesture.
  }
}
