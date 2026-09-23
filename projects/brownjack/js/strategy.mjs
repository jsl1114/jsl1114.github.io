// strategy.mjs — basic strategy for this game's rules: six decks, dealer stands
// on all 17s, double on any first two cards, double after a split allowed, one
// split per hand, no surrender. The coach compares each move to it.
import { handValue } from './blackjack.mjs'

const upValue = (card) =>
  card.rank === 'A' ? 11 : ['10', 'J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank)

const between = (up, low, high) => up >= low && up <= high

// Should this pair be split against the dealer's up-card? (5s and 10s never are.)
function splitPair(rank, up) {
  switch (rank) {
    case 'A':
    case '8':
      return true
    case '9':
      return between(up, 2, 6) || up === 8 || up === 9
    case '7':
      return between(up, 2, 7)
    case '6':
      return between(up, 2, 6)
    case '4':
      return between(up, 5, 6)
    case '3':
    case '2':
      return between(up, 2, 7)
    default:
      return false
  }
}

// 'hit', 'stand', 'double' or 'split' for the player's hand against the up-card.
// When doubling isn't allowed, the move falls back to the right hit or stand.
export function bestMove(hand, upCard, { canDouble = hand.length === 2, canSplit = false } = {}) {
  const { total, soft } = handValue(hand)
  const up = upValue(upCard)
  if (canSplit && splitPair(hand[0].rank, up)) return 'split'
  const doubleOr = (fallback) => (canDouble ? 'double' : fallback)

  if (soft) {
    if (total >= 19) return 'stand'
    if (total === 18) return between(up, 3, 6) ? doubleOr('stand') : up <= 8 ? 'stand' : 'hit'
    if (total === 17) return between(up, 3, 6) ? doubleOr('hit') : 'hit'
    if (total >= 15) return between(up, 4, 6) ? doubleOr('hit') : 'hit'
    if (total >= 13) return between(up, 5, 6) ? doubleOr('hit') : 'hit'
    return 'hit'
  }
  if (total >= 17) return 'stand'
  if (total >= 13) return up <= 6 ? 'stand' : 'hit'
  if (total === 12) return between(up, 4, 6) ? 'stand' : 'hit'
  if (total === 11) return up <= 10 ? doubleOr('hit') : 'hit'
  if (total === 10) return up <= 9 ? doubleOr('hit') : 'hit'
  if (total === 9) return between(up, 3, 6) ? doubleOr('hit') : 'hit'
  return 'hit'
}

const upName = (card) =>
  card.rank === 'A' ? 'an ace' : ['J', 'Q', 'K'].includes(card.rank) ? 'a 10' : card.rank === '8' ? 'an 8' : `a ${card.rank}`

// "hard 12 against a 10", "soft 18 against an ace", "a pair of 8s against a 6"
export function describeSpot(hand, upCard, { pair = false } = {}) {
  if (pair) return `a pair of ${hand[0].rank === 'A' ? 'aces' : `${hand[0].rank}s`} against ${upName(upCard)}`
  const { total, soft } = handValue(hand)
  return `${soft ? 'soft' : 'hard'} ${total} against ${upName(upCard)}`
}
