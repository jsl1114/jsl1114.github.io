// strategy.mjs — basic strategy for hitting and standing, for this game's rules
// (six decks, dealer stands on all 17s). The coach compares each move to it.
import { handValue } from './blackjack.mjs'

const upValue = (card) =>
  card.rank === 'A' ? 11 : ['10', 'J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank)

// 'hit' or 'stand' for the player's hand against the dealer's up-card.
export function bestMove(hand, upCard) {
  const { total, soft } = handValue(hand)
  const up = upValue(upCard)
  if (soft) return total >= 19 || (total === 18 && up <= 8) ? 'stand' : 'hit'
  if (total >= 17) return 'stand'
  if (total >= 13) return up <= 6 ? 'stand' : 'hit'
  if (total === 12) return up >= 4 && up <= 6 ? 'stand' : 'hit'
  return 'hit'
}

// "hard 12 against a 10", "soft 18 against an ace"
export function describeSpot(hand, upCard) {
  const { total, soft } = handValue(hand)
  const up = upCard.rank === 'A' ? 'an ace' : ['J', 'Q', 'K'].includes(upCard.rank) ? 'a 10' : upCard.rank === '8' ? 'an 8' : `a ${upCard.rank}`
  return `${soft ? 'soft' : 'hard'} ${total} against ${up}`
}
