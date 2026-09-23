// save.mjs — exporting and importing a player's saved game. Pure: no DOM.
//
// A save file is JSON: { game, version, exportedAt, profile, checksum }. The
// checksum catches corrupted or hand-edited files; it is a deterrent, not
// security, since the save lives in the player's own browser anyway.
import { BADGES, SHOWCASE_SIZE, newProfile } from './ranked.mjs'

export const SAVE_GAME = 'brownjack'
export const SAVE_VERSION = 1
export const MAX_SAVE_BYTES = 100_000

// New counters go at the end: the checksum covers only the counters a save
// actually has, so saves exported before a counter existed still verify.
const COUNTERS = [
  'rp', 'peakRp', 'games', 'wins', 'losses', 'pushes', 'streak', 'bestStreak', 'lossStreak', 'blackjacks', 'daredevilWins',
  'decisions', 'goodDecisions', 'textbookStreak', 'bestTextbookStreak',
]
const BADGE_IDS = new Set(BADGES.map((badge) => badge.id))

// FNV-1a over the profile's canonical JSON.
export function checksum(profile) {
  const text = JSON.stringify(canonical(profile))
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

// Key order fixed, so the checksum doesn't depend on how the profile was built.
function canonical(profile) {
  const badges = Object.keys(profile.badges ?? {})
    .sort()
    .map((id) => [id, profile.badges[id]?.count, profile.badges[id]?.first])
  const counters = COUNTERS.filter((key) => key in profile).map((key) => profile[key])
  return [...counters, badges, profile.showcase ?? []]
}

export function exportSave(profile, now = new Date()) {
  const clean = { ...newProfile(), ...profile }
  return JSON.stringify(
    { game: SAVE_GAME, version: SAVE_VERSION, exportedAt: now.toISOString(), profile: clean, checksum: checksum(clean) },
    null,
    2,
  )
}

export const saveFileName = (now = new Date()) => `brownjack-save-${now.toISOString().slice(0, 10)}.json`

class SaveError extends Error {}
const fail = (message) => {
  throw new SaveError(message)
}
const isCount = (n) => Number.isInteger(n) && n >= 0

// Returns { profile, exportedAt } or { error } with a message fit to show the player.
export function parseSave(text) {
  try {
    if (typeof text !== 'string' || !text.trim()) fail('The file is empty.')
    if (text.length > MAX_SAVE_BYTES) fail("That file is too large to be a BrownJack save.")
    let data
    try {
      data = JSON.parse(text)
    } catch {
      fail("That file isn't a BrownJack save: it isn't valid JSON.")
    }
    if (data?.game !== SAVE_GAME) fail("That file isn't a BrownJack save.")
    if (data.version !== SAVE_VERSION) {
      fail(data.version > SAVE_VERSION
        ? 'That save comes from a newer version of BrownJack.'
        : "That save's format is no longer supported.")
    }
    const saved = data.profile
    if (!saved || typeof saved !== 'object') fail('The save is missing its game data.')
    if (checksum(saved) !== data.checksum) fail('The save was modified or is damaged, so it can’t be imported.')

    const profile = { ...newProfile() }
    for (const key of COUNTERS) {
      const value = saved[key] ?? 0
      if (!isCount(value)) fail('The save has invalid numbers in it.')
      profile[key] = value
    }
    if (profile.peakRp < profile.rp) fail('The save’s rank points don’t add up.')
    if (profile.wins + profile.losses + profile.pushes > profile.games) fail('The save’s hand counts don’t add up.')
    if (profile.goodDecisions > profile.decisions) fail('The save’s strategy stats don’t add up.')

    // Badges this version doesn't know about are dropped rather than failing the import.
    profile.badges = {}
    for (const [id, badge] of Object.entries(saved.badges ?? {})) {
      if (!BADGE_IDS.has(id)) continue
      if (!isCount(badge?.count) || badge.count < 1 || !Number.isFinite(badge.first)) fail('The save has an invalid badge in it.')
      profile.badges[id] = { count: badge.count, first: badge.first }
    }
    profile.showcase = [...new Set(Array.isArray(saved.showcase) ? saved.showcase : [])]
      .filter((id) => profile.badges[id])
      .slice(0, SHOWCASE_SIZE)

    const exportedAt = Date.parse(data.exportedAt)
    return { profile, exportedAt: Number.isFinite(exportedAt) ? exportedAt : null }
  } catch (error) {
    if (error instanceof SaveError) return { error: error.message }
    throw error
  }
}
