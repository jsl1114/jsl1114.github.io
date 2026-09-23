// blackjack.mjs — the rules, kept free of the DOM so they can be tested.
// Cards are drawn from the end of the deck array.

export const SUITS = ['spades', 'hearts', 'clubs', 'diamonds']
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const sameCard = (a, b) => a.rank === b.rank && a.suit === b.suit

export const createDeck = () =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })))

// Fisher–Yates: every ordering is equally likely.
export function shuffle(deck, random = Math.random) {
  const result = [...deck]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Ranked play deals from a six-deck shoe that carries over between hands. Once
// the cut card is reached (75% dealt), the next hand starts a fresh shoe.
export const SHOE_DECKS = 6
export const CUT_CARD = 0.75

export function createShoe(decks = SHOE_DECKS, random = Math.random) {
  const cards = shuffle(Array.from({ length: decks }, createDeck).flat(), random)
  return { cards, size: cards.length }
}

export const needsShuffle = (shoe) => !shoe || shoe.cards.length <= shoe.size * (1 - CUT_CARD)

// A shuffled 52-card deck with `stacked` on top, so stacked[0] is drawn first.
// Stacked cards are taken out of the rest of the deck, so nothing is duplicated.
export function buildDeck(stacked = [], random = Math.random) {
  const rest = createDeck().filter((card) => !stacked.some((s) => sameCard(s, card)))
  return [...shuffle(rest, random), ...[...stacked].reverse()]
}

// Aces count as 1, and one of them counts as 11 when that doesn't bust the hand.
export function handValue(hand) {
  let total = 0
  let hasAce = false
  for (const { rank } of hand) {
    if (rank === 'A') hasAce = true
    total += rank === 'A' ? 1 : ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank)
  }
  const soft = hasAce && total + 10 <= 21
  return { total: soft ? total + 10 : total, soft }
}

export const isBlackjack = (hand) => hand.length === 2 && handValue(hand).total === 21

// The dealer never looks at the player's cards: hit below 17, stand on all 17s.
export const dealerShouldHit = (hand) => handValue(hand).total < 17

// A pair can be split once, into two hands.
export const canSplit = (hand) => hand.length === 2 && hand[0].rank === hand[1].rank

// 'player' | 'dealer' | 'push'. After a split, a two-card 21 isn't a blackjack.
export function outcome(player, dealer, { split = false } = {}) {
  const p = handValue(player).total
  const d = handValue(dealer).total
  const natural = !split && isBlackjack(player)
  if (p > 21) return 'dealer'
  if (d > 21) return 'player'
  if (natural !== isBlackjack(dealer)) return natural ? 'player' : 'dealer'
  if (p === d) return 'push'
  return p > d ? 'player' : 'dealer'
}
