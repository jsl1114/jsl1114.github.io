/* eslint-disable no-prototype-builtins */
// cards.mjs
const suits = { SPADES: '♠️', HEARTS: '❤️', CLUBS: '♣️', DIAMONDS: '♦️' }
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function range(start, end, inc) {
  const arr = []
  if (arguments.length === 1) {
    start = 0
    end = arguments[0]
    inc = 1
  }
  if (arguments.length === 2) {
    start = arguments[0]
    end = arguments[1]
    inc = 1
  }
  for (let i = start; i < end; i += inc) {
    arr.push(i)
  }
  return arr
}

function generateDeck() {
  const deck = []
  const suitsArr = Object.values(suits)
  for (let i = 0; i < suitsArr.length; i++) {
    for (let j = 0; j < ranks.length; j++) {
      deck.push({ suit: suitsArr[i], rank: ranks[j] })
    }
  }
  return deck
}

function shuffle(deck) {
  const retDeck = [...deck]

  // Fisher-Yates shuffle algorithm
  // https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
  for (let i = retDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[retDeck[i], retDeck[j]] = [retDeck[j], retDeck[i]]
  }

  return retDeck
}

function draw(cardsArray, n = 1) {
  const retDeck = [...cardsArray]
  const drawnCards = retDeck.splice(-n)

  return [retDeck, drawnCards]
}

function deal(cardsArray, numHands = 2, cardsPerHand = 5) {
  const retDeck = [...cardsArray]
  const drawnCards = retDeck.splice(-(numHands * cardsPerHand))
  const hands = []
  for (let i = 0; i < numHands; i++) {
    hands.push(drawnCards.splice(-cardsPerHand))
  }
  const retObj = {
    deck: retDeck,
    hands: hands,
  }

  return retObj
}

function handToString(hand, sep = '  ', numbers = false) {
  const result = []
  hand.forEach((card, index) => {
    const position = numbers ? `${index + 1}: ` : ''
    const cardStr = `${position}${card.rank}${card.suit}`
    result.push(cardStr)
  })

  return result.join(sep)
}

function matchesAnyProperty(obj, matchObj) {
  for (const key in obj) {
    if (matchObj.hasOwnProperty(key) && obj[key] === matchObj[key]) {
      return true
    }
  }
  return false
}

function drawUntilPlayable(deck, matchObject) {
  const retDeck = [...deck]
  const drawnCards = []

  // check if a card is playable
  const isPlayable = (card) => {
    return (
      card.rank === '8' ||
      card.rank === matchObject.rank ||
      card.suit === matchObject.suit
    )
  }

  let i = retDeck.length - 1
  // while (i >= 0 && !isPlayable(retDeck[i])) {
  //   drawnCards.push(retDeck.pop());
  //   i--;
  // }

  do {
    drawnCards.push(retDeck.pop())
    i--
  } while (i >= 0 && !isPlayable(retDeck[i]))

  // draw the playable card, if applicable
  if (i >= 0) {
    drawnCards.push(retDeck.pop())
  }

  return [retDeck, drawnCards]
}

export default {
  range,
  generateDeck,
  shuffle,
  draw,
  deal,
  handToString,
  matchesAnyProperty,
  drawUntilPlayable,
}
