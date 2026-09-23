// cosmetics.mjs — tables and card backs, one of each unlocked per tier by the
// player's best-ever rank, so dropping a tier never takes one away.
import { TIERS } from './ranked.mjs'

const TIER_NAMES = [...TIERS, 'Legend']

export const TABLES = [
  { id: 'oak', name: 'Oak', tier: 0 },
  { id: 'casino', name: 'Casino felt', tier: 1 },
  { id: 'royal', name: 'Royal navy', tier: 2 },
  { id: 'velvet', name: 'Burgundy velvet', tier: 3 },
  { id: 'midnight', name: 'Midnight', tier: 4 },
  { id: 'aurora', name: 'Aurora', tier: 5 },
]

export const CARD_BACKS = [
  { id: 'classic', name: 'Classic', tier: 0, file: 'back.svg' },
  { id: 'sapphire', name: 'Sapphire lattice', tier: 1, file: 'back-sapphire.svg' },
  { id: 'gilded', name: 'Gilded', tier: 2, file: 'back-gilded.svg' },
  { id: 'deco', name: 'Teal deco', tier: 3, file: 'back-deco.svg' },
  { id: 'facets', name: 'Diamond facets', tier: 4, file: 'back-facets.svg' },
  { id: 'starfield', name: 'Starfield', tier: 5, file: 'back-starfield.svg' },
]

export const unlockTier = (item) => TIER_NAMES[item.tier]
export const isUnlocked = (item, peakTierIndex) => peakTierIndex >= item.tier

// The chosen item if it's unlocked, otherwise the default (as after importing
// a save with a lower rank).
export function selected(list, id, peakTierIndex) {
  const item = list.find((entry) => entry.id === id)
  return item && isUnlocked(item, peakTierIndex) ? item : list[0]
}

// What reaching `tierIndex` unlocks, e.g. "Royal navy table and Gilded card back".
export function unlocksAt(tierIndex) {
  const table = TABLES.find((t) => t.tier === tierIndex)
  const back = CARD_BACKS.find((b) => b.tier === tierIndex)
  return table && back ? `${table.name} table and ${back.name} card back` : ''
}
