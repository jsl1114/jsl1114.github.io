// cosmetics.mjs — tables and card backs, and what unlocks each. Pure: no DOM.
//
// Half of each set is unlocked by rank (best-ever tier, so dropping a tier never
// takes one away); the rest by doing something: winning hands, daily streaks,
// Legendary badges and so on. Every check reads a context:
//   { profile, daily: { bestStreak, completed } }
import { BADGES } from './badges.mjs'
import { TIERS, rankOf } from './ranked.mjs'

const TIER_NAMES = [...TIERS, 'Legend']
const LEGENDARY = new Set(BADGES.filter((b) => b.rarity === 'Legendary').map((b) => b.id))

// Each kind of condition: how far along the player is, and how to say it.
// `status` (optional) replaces the default "current/target" progress line.
const CONDITIONS = {
  tier: { current: (c) => rankOf(c.profile.peakRp).tierIndex, text: (n) => `Reach ${TIER_NAMES[n]}`, status: () => '' },
  wins: { current: (c) => c.profile.wins, text: (n) => `Win ${n} ranked hands` },
  games: { current: (c) => c.profile.games, text: (n) => `Play ${n} ranked hands` },
  blackjacks: { current: (c) => c.profile.blackjacks, text: (n) => `Get dealt ${n} blackjacks` },
  badges: { current: (c) => Object.keys(c.profile.badges).length, text: (n) => `Earn ${n} badges` },
  legendaryBadges: {
    current: (c) => Object.keys(c.profile.badges).filter((id) => LEGENDARY.has(id)).length,
    text: (n) => `Earn ${n} Legendary badges`,
  },
  badge: {
    current: (c, target) => (c.profile.badges[target] ? 1 : 0),
    text: (id) => `Earn the ${BADGES.find((b) => b.id === id).name} badge`,
    target: () => 1,
    status: () => '',
  },
  // Accuracy only counts once enough decisions have been made.
  strategy: {
    current: (c, target) => {
      const { decisions, goodDecisions } = c.profile
      return decisions >= target.decisions ? Math.floor((100 * goodDecisions) / decisions) : 0
    },
    text: (t) => `Play ${t.percent}% by basic strategy over ${t.decisions}+ decisions`,
    target: (t) => t.percent,
    status: (c, t) => {
      const { decisions, goodDecisions } = c.profile
      return decisions < t.decisions ? `${decisions}/${t.decisions} decisions` : `now ${Math.floor((100 * goodDecisions) / decisions)}%`
    },
  },
  seasonMedal: {
    current: (c) => Math.max(-1, ...(c.profile.seasons ?? []).map((s) => rankOf(s.finalRp).tierIndex)),
    text: (n) => `Finish a season in ${TIER_NAMES[n]} or higher`,
    status: () => '',
  },
  dailyStreak: { current: (c) => c.daily.bestStreak, text: (n) => `Play the daily challenge ${n} days in a row` },
  dailies: { current: (c) => c.daily.completed, text: (n) => `Complete ${n} daily challenges` },
}

export const TABLES = [
  { id: 'oak', name: 'Oak', unlock: ['tier', 0] },
  { id: 'walnut', name: 'Walnut', unlock: ['tier', 1] },
  { id: 'maple', name: 'Maple', unlock: ['tier', 2] },
  { id: 'cherry', name: 'Cherry', unlock: ['tier', 3] },
  { id: 'ebony', name: 'Ebony', unlock: ['tier', 4] },
  { id: 'gilded-oak', name: 'Gilded oak', unlock: ['tier', 5] },
  { id: 'caramel', name: 'Caramel felt', unlock: ['wins', 100] },
  { id: 'cocoa', name: 'Cocoa leather', unlock: ['games', 500] },
  { id: 'espresso', name: 'Espresso felt', unlock: ['dailyStreak', 7] },
  { id: 'toffee', name: 'Toffee felt', unlock: ['seasonMedal', 2] },
  { id: 'chocolate', name: 'Chocolate velvet', unlock: ['badges', 30] },
  { id: 'mustard', name: 'BrownJack mustard', unlock: ['legendaryBadges', 3] },
]

export const CARD_BACKS = [
  { id: 'classic', name: 'Classic', file: 'back.svg', unlock: ['tier', 0] },
  { id: 'sapphire', name: 'Sapphire lattice', file: 'back-sapphire.svg', unlock: ['tier', 1] },
  { id: 'gilded', name: 'Gilded', file: 'back-gilded.svg', unlock: ['tier', 2] },
  { id: 'deco', name: 'Teal deco', file: 'back-deco.svg', unlock: ['tier', 3] },
  { id: 'facets', name: 'Diamond facets', file: 'back-facets.svg', unlock: ['tier', 4] },
  { id: 'starfield', name: 'Starfield', file: 'back-starfield.svg', unlock: ['tier', 5] },
  { id: 'lucky7', name: 'Lucky sevens', file: 'back-lucky7.svg', unlock: ['badge', 'sevens'] },
  { id: 'shark', name: 'Card shark', file: 'back-shark.svg', unlock: ['strategy', { percent: 90, decisions: 300 }] },
  { id: 'sunrise', name: 'Sunrise', file: 'back-sunrise.svg', unlock: ['dailies', 10] },
  { id: 'midas', name: 'Midas', file: 'back-midas.svg', unlock: ['blackjacks', 50] },
  { id: 'royal-bj', name: 'BrownJack royal', file: 'back-royal-bj.svg', unlock: ['badges', 40] },
  { id: 'legendary', name: 'Legendary', file: 'back-legendary.svg', unlock: ['legendaryBadges', 3], shimmer: true },
]

// { unlocked, current, target, text, status } for one item; `status` is a short
// progress line such as "12/30" (empty where a count wouldn't mean anything).
export function progress(item, context) {
  const [kind, value] = item.unlock
  const condition = CONDITIONS[kind]
  const target = condition.target ? condition.target(value) : value
  const current = Math.max(0, Math.min(condition.current(context, value), target))
  const status = condition.status ? condition.status(context, value) : `${current}/${target}`
  return { unlocked: condition.current(context, value) >= target, current, target, text: condition.text(value), status }
}

export const isUnlocked = (item, context) => progress(item, context).unlocked
export const byRank = (item) => item.unlock[0] === 'tier'

// The chosen item if it's unlocked, otherwise the default (as after importing
// a lower-ranked save).
export function selected(list, id, context) {
  const item = list.find((entry) => entry.id === id)
  return item && isUnlocked(item, context) ? item : list[0]
}

// Ids of everything unlocked, to spot what a hand or a daily just unlocked.
export const unlockedIds = (context) =>
  [...TABLES, ...CARD_BACKS].filter((item) => isUnlocked(item, context)).map((item) => item.id)

// What reaching `tierIndex` unlocks, e.g. "Maple table and Gilded card back".
export function unlocksAt(tierIndex) {
  const table = TABLES.find((t) => byRank(t) && t.unlock[1] === tierIndex)
  const back = CARD_BACKS.find((b) => byRank(b) && b.unlock[1] === tierIndex)
  return table && back ? `${table.name} table and ${back.name} card back` : ''
}
