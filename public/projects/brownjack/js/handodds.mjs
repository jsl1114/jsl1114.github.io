// handodds.mjs — how rare a finished hand was, and its grade. Pure.
//
// A hand is as rare as the rarest thing it did: a hand badge it qualifies for
// (Aces High, Lucky Sevens, a blackjack…) or, failing that, just its result.
// Each has a "1 in N hands" frequency from simulating basic-strategy play on a
// six-deck shoe, so the more exciting the hand, the rarer it is and the better
// its grade. Among hands that did the same thing, the chance of the exact cards
// breaks ties.
import { RANKS, SHOE_DECKS, handValue, isBlackjack } from './blackjack.mjs'
import { BADGES, badgeById } from './badges.mjs'

// ---- What a hand did ------------------------------------------------------------

// Badges about the hand itself (not streaks, career or the calendar).
export const HAND_BADGES = BADGES.filter((b) => b.category === 'Hands')

// What a finished hand did: its result, then every hand badge it qualifies for,
// earned before or not. `hands` are { cards, winner, doubled, riskyHit, needle,
// hailMary }; `dealer` is the dealer's cards.
export function handFeatures({ hands, dealer }) {
  const split = hands.length > 1
  const dealt = split ? [hands[0].cards[0], hands[1].cards[0]] : hands[0].cards.slice(0, 2)
  const natural = !split && isBlackjack(hands[0].cards)
  const handsWon = hands.filter((h) => h.winner === 'player').length
  const handsLost = hands.filter((h) => h.winner === 'dealer').length
  const overall = handsWon > handsLost ? 'player' : handsLost > handsWon ? 'dealer' : 'push'
  const base = { overall, natural, dealt, split, handsWon, dealer, dv: handValue(dealer).total, round: { hands } }
  const contexts = hands.map((hand) => ({
    ...base,
    player: hand.cards,
    pv: handValue(hand.cards).total,
    won: hand.winner === 'player',
    lost: hand.winner === 'dealer',
    doubled: Boolean(hand.doubled),
    riskyHit: Boolean(hand.riskyHit),
    needle: Boolean(hand.needle),
    hailMary: Boolean(hand.hailMary),
  }))
  const won21 = !natural && contexts.some((x) => x.won && x.pv === 21)
  const result = overall === 'player' ? (won21 ? 'win-21' : 'win') : overall === 'dealer' ? 'loss' : 'push'
  return [result, ...HAND_BADGES.filter((b) => contexts.some((x) => b.check(x))).map((b) => b.id)]
}

// ---- How often each happens -------------------------------------------------------

// Per hand, from 20 million simulated hands of basic strategy (six decks, cut
// card at 75%). Needle Threader and Hail Mary need a hit basic strategy never
// makes: theirs is how often you stand on that hard total, times the chance of
// the one card you needed, times trying it one time in ten.
export const FEATURE_ODDS = {
  loss: 1 / 2.09,
  win: 1 / 2.63,
  push: 1 / 11.2,
  twins: 1 / 13.5,
  'doubled-up': 1 / 17.8,
  'face-off': 1 / 19,
  'win-21': 1 / 19.3,
  ambushed: 1 / 21.1,
  natural: 1 / 21.1,
  'so-close': 1 / 22.1,
  'doubled-out': 1 / 25.7,
  'photo-finish': 1 / 58.6,
  heartbreaker: 1 / 60.4,
  'hard-way': 1 / 74.9,
  'low-roller': 1 / 78.2,
  overloaded: 1 / 79.5,
  'suited-up': 1 / 84.4,
  flush: 1 / 104,
  'split-decision': 1 / 109,
  'double-whammy': 1 / 123,
  charlie: 1 / 165,
  'snake-eyes': 1 / 176,
  'royal-couple': 1 / 339,
  'slow-burn': 1 / 347,
  needle: 1 / 390,
  meltdown: 1 / 452,
  standoff: 1 / 462,
  straight: 1 / 604,
  timber: 1 / 619,
  original: 1 / 676,
  'aces-low': 1 / 925,
  'hail-mary': 1 / 958,
  'six-charlie': 1 / 1_520,
  'ace-collector': 1 / 1_810,
  'bad-beat': 1 / 1_840,
  'aces-high': 1 / 1_910,
  'full-house': 1 / 2_040,
  'double-trouble': 1 / 2_500,
  'long-con': 1 / 3_390,
  'four-kind': 1 / 4_490,
  'double-disaster': 1 / 4_860,
  sevens: 1 / 4_890,
  'seven-charlie': 1 / 19_400,
  'dead-mans-hand': 1 / 20_200,
}

const RESULT_NAMES = { loss: 'A loss', push: 'A push', win: 'A win', 'win-21': 'A win on 21' }
export const featureName = (id) => RESULT_NAMES[id] ?? badgeById(id)?.name ?? id

// ---- Exact cards, for ties -----------------------------------------------------------

const PER_RANK = SHOE_DECKS * 4
const SHOE = RANKS.length * PER_RANK

// ln C(n, k), summed as logs so long hands don't overflow.
function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity
  let sum = 0
  for (let i = 1; i <= k; i++) sum += Math.log(n - k + i) - Math.log(i)
  return sum
}

const tally = (cards) => {
  const counts = {}
  for (const { rank } of cards) counts[rank] = (counts[rank] ?? 0) + 1
  return counts
}

// The chance of exactly these ranks, yours and the dealer's, from a fresh shoe
// (order and suits aside): yours from the full shoe, then the dealer's from
// what's left, each a multivariate hypergeometric draw.
export function cardChance(player, dealer) {
  const mine = tally(player)
  const theirs = tally(dealer)
  let log = -logChoose(SHOE, player.length) - logChoose(SHOE - player.length, dealer.length)
  for (const rank of RANKS) {
    log += logChoose(PER_RANK, mine[rank] ?? 0) + logChoose(PER_RANK - (mine[rank] ?? 0), theirs[rank] ?? 0)
  }
  return Math.exp(log)
}

// ---- Rating and grades ---------------------------------------------------------------

// Grades by "1 in N hands": a plain win, loss or push is D; a blackjack C;
// Photo Finish B; Five-Card Charlie A; Standoff S; Hail Mary SS; Aces High and
// the rest of the legendary hands SSS.
export const GRADES = [
  { grade: 'SSS', from: 1500 },
  { grade: 'SS', from: 700 },
  { grade: 'S', from: 300 },
  { grade: 'A', from: 100 },
  { grade: 'B', from: 40 },
  { grade: 'C', from: 12 },
  { grade: 'D', from: 0 },
]

export const gradeOf = (chance) => GRADES.find((g) => 1 / chance >= g.from).grade

const atLeast = (from) => (grade) => GRADES.some((g) => g.grade === grade) &&
  GRADES.findIndex((g) => g.grade === grade) <= GRADES.findIndex((g) => g.grade === from)

// S and above make the Hall of Fame; A and above get their grade shown after the hand.
export const HALL_OF_FAME_FROM = 'S'
export const isHallOfFame = atLeast(HALL_OF_FAME_FROM)
export const isNotable = atLeast('A')

// { chance, grade, reason, brutal, cardChance }: `reason` is what made the hand
// rare, and `brutal` whether that was rare the painful way.
export function rateHand(record) {
  const odds = (id) => FEATURE_ODDS[id] ?? 1
  const reason = handFeatures(record).reduce((rarest, id) => (odds(id) < odds(rarest) ? id : rarest))
  const chance = odds(reason)
  return {
    chance,
    grade: gradeOf(chance),
    reason,
    brutal: Boolean(badgeById(reason)?.brutal),
    cardChance: cardChance(record.hands.flatMap((h) => h.cards), record.dealer),
  }
}

// Rarest first: by what the hand did, then by its exact cards.
export const rarerThan = (a, b) => a.chance - b.chance || a.cardChance - b.cardChance

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 3 })

// "1 in 840", "1 in 62.5K", "1 in 4.2M".
export const oneIn = (chance) => `1 in ${compact.format(Math.round(1 / chance))}`
