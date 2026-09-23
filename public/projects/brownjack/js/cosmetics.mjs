// cosmetics.mjs — tables and card backs, and what unlocks each. Pure: no DOM.
//
// Card backs: one for each tier (by best-ever rank, so dropping a tier never
// takes one away) and one for each Legendary badge, themed on it. Tables: earned
// with collection points, which every badge adds by rarity. Every check reads a
// context: { profile }.
import { BADGES } from './badges.mjs'
import { TIERS, rankOf } from './ranked.mjs'

const TIER_NAMES = [...TIERS, 'Legend']

export const RARITY_POINTS = { Common: 1, Rare: 3, Epic: 8, Legendary: 20 }

export const collectionPoints = (profile) =>
  BADGES.reduce((sum, badge) => sum + (profile.badges[badge.id] ? RARITY_POINTS[badge.rarity] : 0), 0)

export const TOTAL_POINTS = BADGES.reduce((sum, badge) => sum + RARITY_POINTS[badge.rarity], 0)

// Each kind of condition: how far along the player is, and how to say it.
// `status` (optional) replaces the default "current/target" progress line.
const CONDITIONS = {
  tier: {
    current: (c) => rankOf(c.profile.peakRp).tierIndex,
    text: (n) => `Reach ${TIER_NAMES[n]}`,
    status: () => '',
  },
  badge: {
    current: (c, id) => (c.profile.badges[id] ? 1 : 0),
    target: () => 1,
    text: (id) => `Earn the ${BADGES.find((b) => b.id === id).name} badge`,
    status: () => '',
  },
  points: {
    current: (c) => collectionPoints(c.profile),
    text: (n) => `${n} collection points`,
  },
}

// Tables: Oak is the plain wooden table; the rest are casino layouts
// (tableart.mjs) earned with collection points.
export const TABLES = [
  { id: 'oak', name: 'Oak', unlock: ['points', 0] },
  { id: 'coffeehouse', name: 'Coffeehouse', unlock: ['points', 10] },
  { id: 'saloon', name: 'Saloon', unlock: ['points', 25] },
  { id: 'harvest', name: 'Harvest', unlock: ['points', 45] },
  { id: 'canyon', name: 'Red Canyon', unlock: ['points', 70] },
  { id: 'library', name: 'Reading Room', unlock: ['points', 100] },
  { id: 'riverboat', name: 'Riverboat', unlock: ['points', 140] },
  { id: 'speakeasy', name: 'Speakeasy', unlock: ['points', 185] },
  { id: 'havana', name: 'Havana Club', unlock: ['points', 235] },
  { id: 'chocolatier', name: 'Chocolatier', unlock: ['points', 290] },
  { id: 'royal', name: 'BrownJack Royal', unlock: ['points', 340] },
]

const legendaryBack = (badge, id, name) => ({ id, name, file: `back-${id}.svg`, unlock: ['badge', badge], shimmer: true })

export const CARD_BACKS = [
  { id: 'classic', name: 'Classic', file: 'back.svg', unlock: ['tier', 0] },
  { id: 'sapphire', name: 'Sapphire lattice', file: 'back-sapphire.svg', unlock: ['tier', 1] },
  { id: 'gilded', name: 'Gilded', file: 'back-gilded.svg', unlock: ['tier', 2] },
  { id: 'deco', name: 'Teal deco', file: 'back-deco.svg', unlock: ['tier', 3] },
  { id: 'facets', name: 'Diamond facets', file: 'back-facets.svg', unlock: ['tier', 4] },
  { id: 'starfield', name: 'Starfield', file: 'back-starfield.svg', unlock: ['tier', 5] },
  // One for each Legendary badge, themed on it.
  legendaryBack('sevens', 'sevens', 'Jackpot'),
  legendaryBack('seven-charlie', 'charlie', 'Seven-card fan'),
  legendaryBack('dead-mans-hand', 'deadman', 'Wanted'),
  legendaryBack('aces-high', 'aces', 'Winged aces'),
  legendaryBack('inferno', 'inferno', 'Inferno'),
  legendaryBack('legend', 'legend', 'Crowned crest'),
  legendaryBack('constellation', 'constellation', 'Star chart'),
  legendaryBack('season-legend', 'season', 'Laurel'),
  legendaryBack('completionist', 'completionist', 'Mosaic'),
]

// { unlocked, current, target, text, status } for one item; `status` is a short
// progress line such as "12/30" (empty where a count wouldn't mean anything).
export function progress(item, context) {
  const [kind, value] = item.unlock
  const condition = CONDITIONS[kind]
  const target = condition.target ? condition.target(value) : value
  const reached = condition.current(context, value)
  const current = Math.max(0, Math.min(reached, target))
  const status = condition.status ? condition.status(context, value) : `${current}/${target}`
  return { unlocked: reached >= target, current, target, text: condition.text(value), status }
}

export const isUnlocked = (item, context) => progress(item, context).unlocked
export const byRank = (item) => item.unlock[0] === 'tier'

// The chosen item if it's unlocked, otherwise the default (as after importing
// a lower-ranked save).
export function selected(list, id, context) {
  const item = list.find((entry) => entry.id === id)
  return item && isUnlocked(item, context) ? item : list[0]
}

// Ids of everything unlocked, to spot what a hand just unlocked.
export const unlockedIds = (context) =>
  [...TABLES, ...CARD_BACKS].filter((item) => isUnlocked(item, context)).map((item) => item.id)

// The next table the player's points are working towards, if any.
export const nextTable = (context) => TABLES.find((table) => !isUnlocked(table, context)) ?? null

// What reaching `tierIndex` unlocks, e.g. "the Gilded card back".
export function unlocksAt(tierIndex) {
  const back = CARD_BACKS.find((b) => byRank(b) && b.unlock[1] === tierIndex)
  return back ? `the ${back.name} card back` : ''
}
