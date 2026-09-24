// handodds.mjs — how likely a finished hand's cards were, and its grade. Pure.
//
// The chance is of being dealt exactly these cards, yours and the dealer's, from
// a fresh six-deck shoe: which ranks each of you holds counts, the order they
// came in and their suits don't. A split counts both of your hands together.
import { RANKS, SHOE_DECKS } from './blackjack.mjs'

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

// Your cards are drawn from the full shoe, then the dealer's from what's left:
// each is a multivariate hypergeometric draw. Returned as a natural log.
export function logHandChance(player, dealer) {
  const mine = tally(player)
  const theirs = tally(dealer)
  let log = -logChoose(SHOE, player.length) - logChoose(SHOE - player.length, dealer.length)
  for (const rank of RANKS) {
    log += logChoose(PER_RANK, mine[rank] ?? 0) + logChoose(PER_RANK - (mine[rank] ?? 0), theirs[rank] ?? 0)
  }
  return log
}

export const handChance = (player, dealer) => Math.exp(logHandChance(player, dealer))

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumSignificantDigits: 3 })

// "1 in 840", "1 in 62.5K", "1 in 4.2M".
export const oneIn = (chance) => `1 in ${compact.format(Math.round(1 / chance))}`

// Grades by how rare the hand is, as "1 in N" cut-offs. Set by simulating
// basic-strategy play from a six-deck shoe (see tests/brownjack-handodds.test.js),
// so roughly: D 35% of hands, C 25%, B 18%, A 12%, S 6%, SS 3%, SSS 1%.
// Almost any exact table is rare (the median hand is about 1 in 60,000), so the
// grades are about how it ranks against other hands, not the raw number.
export const GRADES = [
  { grade: 'SSS', from: 10_000_000 },
  { grade: 'SS', from: 2_200_000 },
  { grade: 'S', from: 550_000 },
  { grade: 'A', from: 200_000 },
  { grade: 'B', from: 100_000 },
  { grade: 'C', from: 30_000 },
  { grade: 'D', from: 0 },
]

// S and above make the Hall of Fame.
export const HALL_OF_FAME_FROM = 'S'
export const isHallOfFame = (grade) =>
  GRADES.findIndex((g) => g.grade === grade) <= GRADES.findIndex((g) => g.grade === HALL_OF_FAME_FROM)

export const gradeOf = (chance) => GRADES.find((g) => 1 / chance >= g.from).grade
