// sound.mjs — synthesized sound effects and vibration, honouring the player's
// preferences. Everything is generated with the Web Audio API, so there are no
// audio files; outside a browser (or with no audio) every call is a no-op.
import { getSettings } from './prefs.mjs'

const VOLUME = 0.22

let audio = null

export const canVibrate = () => typeof globalThis.navigator?.vibrate === 'function'

// Browsers only allow audio after a user gesture; every sound here follows one.
function context() {
  if (!getSettings().sound) return null
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

// A short burst of filtered noise (used for the flip, riffle and bust).
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

// A card landing on felt: a very short, bright click (the card's edge) and a
// soft low thud (the card settling). A long noise burst is what sounded like a
// gas burner; the click here lasts a few milliseconds and falls off fast.
// Every value can be tuned in the dev test page's Sound lab.
export const CARD_SOUND = {
  clickMs: 9, // how long the click lasts
  clickHz: 3200, // its brightness (a low-pass cutoff)
  clickDecay: 6, // how sharply it falls off: higher is crisper
  clickLevel: 0.9,
  thudHz: 150, // the thud's pitch, sliding down as it settles
  thudMs: 45,
  thudLevel: 0.55,
  vary: 0.12, // random variation per card, so a deal isn't machine-like
}

export function cardSound(ctx, at = 0, settings = CARD_SOUND) {
  const t = ctx.currentTime + at
  const vary = (x) => x * (1 + (Math.random() * 2 - 1) * settings.vary)

  const length = Math.max(0.002, vary(settings.clickMs) / 1000)
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp((-settings.clickDecay * i) / data.length)
  const click = ctx.createBufferSource()
  click.buffer = buffer
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = vary(settings.clickHz)
  const clickGain = ctx.createGain()
  clickGain.gain.value = VOLUME * settings.clickLevel
  click.connect(tone).connect(clickGain).connect(ctx.destination)
  click.start(t)

  if (settings.thudLevel > 0) {
    const thud = ctx.createOscillator()
    const thudGain = ctx.createGain()
    const thudLength = settings.thudMs / 1000
    thud.type = 'sine'
    thud.frequency.setValueAtTime(vary(settings.thudHz), t)
    thud.frequency.exponentialRampToValueAtTime(Math.max(40, settings.thudHz * 0.55), t + thudLength)
    thudGain.gain.setValueAtTime(0.0001, t)
    thudGain.gain.exponentialRampToValueAtTime(VOLUME * settings.thudLevel, t + 0.004)
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + thudLength)
    thud.connect(thudGain).connect(ctx.destination)
    thud.start(t)
    thud.stop(t + thudLength + 0.02)
  }
}

const arpeggio = (ctx, notes, { step = 0.09, length = 0.3, type = 'triangle', gain = 0.8, at = 0 } = {}) =>
  notes.forEach((freq, i) => tone(ctx, { freq, at: at + i * step, length, type, gain }))

// Notes (Hz) for the stings.
const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568, C7 = 2093

const SOUNDS = {
  deal: (ctx, at) => cardSound(ctx, at),
  flip: (ctx) => snap(ctx, { length: 0.12, freq: 1200, gain: 0.7 }),
  // A riffle: a quick run of soft snaps.
  shuffle: (ctx) => {
    for (let i = 0; i < 14; i++) snap(ctx, { at: i * 0.028, length: 0.03, freq: 1800 + Math.random() * 1400, gain: 0.45 })
  },
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

// The audio context, for the dev test page's Sound lab (null when muted).
export const audioContext = () => context()

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
  if (!getSettings().haptics || !canVibrate()) return
  // Browsers refuse (and complain) until the player has touched the page.
  if (globalThis.navigator.userActivation && !globalThis.navigator.userActivation.hasBeenActive) return
  try {
    globalThis.navigator.vibrate(PATTERNS[name])
  } catch {
    // Some browsers refuse without a recent gesture.
  }
}
