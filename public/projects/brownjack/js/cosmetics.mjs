// cosmetics.mjs — tables and card backs, and what unlocks each. Pure: no DOM.
//
// Each tier (by best-ever rank, so dropping a tier never takes one away)
// unlocks a table and a card back in its metal. The other tables are earned
// with collection points, which every badge adds by rarity, and each Epic and
// Legendary badge unlocks a card back themed on it (the Legendary ones shimmer).
// Every check reads a context:
// { profile }.
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
// (tableart.mjs), six by rank and ten by collection points.
export const TABLES = [
  { id: 'oak', name: 'Oak', unlock: ['points', 0] },
  { id: 'rank-bronze', name: 'Bronze', unlock: ['tier', 0] },
  { id: 'rank-silver', name: 'Silver', unlock: ['tier', 1] },
  { id: 'rank-gold', name: 'Gold', unlock: ['tier', 2] },
  { id: 'rank-platinum', name: 'Platinum', unlock: ['tier', 3] },
  { id: 'rank-diamond', name: 'Diamond', unlock: ['tier', 4] },
  { id: 'rank-legend', name: 'Legend', unlock: ['tier', 5] },
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
const epicBack = (badge, id, name) => ({ id, name, file: `back-${id}.svg`, unlock: ['badge', badge] })

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
  legendaryBack('friday-13', 'friday13', 'Hockey mask'),
  legendaryBack('bankruptcy', 'bestboss', "World's best boss"),
  legendaryBack('four-kind', 'quads', 'Quads'),
  legendaryBack('full-house', 'house', 'House of cards'),
  legendaryBack('hail-mary', 'longshot', 'Long shot'),
  legendaryBack('double-trouble', 'double', 'Double trouble'),
  legendaryBack('back-to-back', 'backtoback', 'Back to back'),
  legendaryBack('new-year', 'fireworks', 'Fireworks'),
  legendaryBack('hall-of-legends', 'pantheon', 'Hall of Legends'),
  // One for each Epic badge: a pattern and a single emblem, with no shimmer.
  epicBack('straight', 'straight', 'Straight'),
  epicBack('ace-collector', 'ace-trio', 'Ace trio'),
  epicBack('six-charlie', 'six-fan', 'Six-card fan'),
  epicBack('bad-beat', 'bad-beat', 'Broken heart'),
  epicBack('standoff', 'standoff', 'Crossed swords'),
  epicBack('meltdown', 'meltdown', 'Meltdown'),
  epicBack('original', 'original', 'The Original'),
  epicBack('rock-bottom', 'rock-bottom', 'Cairn'),
  epicBack('textbook', 'textbook', 'Textbook'),
  epicBack('thrill-seeker', 'thrill', 'Lightning'),
  epicBack('lifer', 'lifer', 'Tally marks'),
  epicBack('royalty', 'royalty', 'Emerald crown'),
  epicBack('diamond', 'brilliant', 'Brilliant cut'),
  epicBack('fresh-start', 'fresh-shoe', 'Sprout'),
  epicBack('collector', 'album', 'Rosette'),
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

// The next table the player's collection points are working towards, if any.
export const nextTable = (context) =>
  TABLES.find((table) => table.unlock[0] === 'points' && !isUnlocked(table, context)) ?? null

// What reaching `tierIndex` unlocks, e.g. "the Gold table and Gilded card back".
export function unlocksAt(tierIndex) {
  const table = TABLES.find((t) => byRank(t) && t.unlock[1] === tierIndex)
  const back = CARD_BACKS.find((b) => byRank(b) && b.unlock[1] === tierIndex)
  return table && back ? `the ${table.name} table and ${back.name} card back` : ''
}
