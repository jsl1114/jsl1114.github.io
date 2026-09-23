// daily.mjs — the daily challenge: five hands from a six-deck shoe shuffled
// from the date, so everyone plays the same deal. Pure: no DOM, no storage.
import { SHOE_DECKS, createShoe } from './blackjack.mjs'

export const DAILY_HANDS = 5
// Daily #1 is the first UTC day the challenge existed.
const FIRST_DAY = Date.UTC(2026, 8, 23)
const DAY = 86_400_000

// Days run on UTC so everyone, everywhere, is on the same challenge.
export const dailyKey = (now = Date.now()) => new Date(now).toISOString().slice(0, 10)
export const dailyNumber = (key) => Math.floor((Date.parse(`${key}T00:00:00Z`) - FIRST_DAY) / DAY) + 1
export const previousKey = (key) => dailyKey(Date.parse(`${key}T00:00:00Z`) - DAY)

// mulberry32, seeded with an FNV-1a hash of the text.
export function seededRandom(text) {
  let seed = 0x811c9dc5
  for (let i = 0; i < text.length; i++) seed = Math.imul(seed ^ text.charCodeAt(i), 0x01000193)
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const dailyShoe = (key) => createShoe(SHOE_DECKS, seededRandom(`brownjack-daily-${key}`))

// A round's score: +1 a win, −1 a loss, 0 a push; a double counts twice and a
// natural blackjack pays 1.5. Split hands add up.
export function roundScore(hands) {
  return hands.reduce((sum, hand) => {
    if (hand.winner === 'push') return sum
    const unit = hand.natural ? 1.5 : 1
    const stake = hand.doubled ? 2 : 1
    return sum + (hand.winner === 'player' ? unit * stake : -stake)
  }, 0)
}

export const totalScore = (rounds) => rounds.reduce((sum, round) => sum + round.score, 0)
export const formatScore = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0')

function emoji(round) {
  if (round.hands.some((h) => h.natural && h.winner === 'player')) return '⭐'
  return round.score > 0 ? '🟩' : round.score < 0 ? '🟥' : '🟨'
}

export function shareText(key, rounds) {
  return [`BrownJack Daily #${dailyNumber(key)} · ${formatScore(totalScore(rounds))}`, rounds.map(emoji).join('')].join('\n')
}

// Consecutive days completed, ending today (or yesterday, if today isn't done yet).
export function dailyStreak(history, today) {
  const done = (key) => history[key]?.rounds?.length === DAILY_HANDS
  let key = done(today) ? today : previousKey(today)
  let streak = 0
  while (done(key)) {
    streak++
    key = previousKey(key)
  }
  return streak
}

// Longest run of consecutive finished days, and how many days were finished.
export function dailyRecord(history) {
  const done = Object.keys(history).filter((key) => history[key]?.rounds?.length === DAILY_HANDS).sort()
  let best = 0
  let run = 0
  let previous = null
  for (const key of done) {
    run = previous && previousKey(key) === previous ? run + 1 : 1
    best = Math.max(best, run)
    previous = key
  }
  return { bestStreak: best, completed: done.length }
}

// A saved day, checked so a damaged entry can't break the game: { rounds, drawn }.
export function cleanDay(day) {
  if (!day || !Array.isArray(day.rounds) || !Number.isInteger(day.drawn) || day.drawn < 0) return null
  const rounds = day.rounds
    .filter((r) => r && Array.isArray(r.hands) && Number.isFinite(r.score))
    .slice(0, DAILY_HANDS)
  return { rounds, drawn: day.drawn }
}
