// game.js
document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.querySelector('.playBtn')
  const start = document.querySelector('.start')
  const game = document.querySelector('.game')
  const inp = document.querySelector('#startValues')

  inp.setAttribute('placeholder', 'comma delimited face values')
  game.classList.add('hide')
  start.prepend(elt('h1', 'title', 'BrownJack', elt('a', 'link', 'by Jason')))

  document
    .querySelector('.link')
    .setAttribute('href', 'https://jsl1114.github.io')
  document.querySelector('.link').setAttribute('target', '_blank')

  playButton.classList.add('btn')
  playButton.setAttribute('value', 'play (enter)')

  document.querySelector('label').textContent = 'Start Values (optional)'

  playButton.addEventListener('click', function (e) {
    e.preventDefault()
    startGame()
  })

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && game.classList.contains('hide')) startGame()
  })

  function startGame() {
    start.classList.add('hide')

    //game starts
    game.classList.remove('hide')
    let deck = shuffle(generateDeck())

    // check for start values
    const startValues = inp.value.toUpperCase().split(',')
    let recognized = []
    startValues.reverse().forEach((v) => {
      if (ranks.includes(v)) {
        const card = {
          suit: Object.values(suits)[Math.floor(Math.random() * 4)],
          rank: v,
        }
        recognized.push(card)
        deck.push(card)
      }
    })
    if (recognized.length > 0) {
      window.alert(
        `pushed recognized cards:\n${handToString(
          recognized.reverse(),
          ', '
        )} \n(suits are drawn randomly since they have no effect on the game)`
      )
    }

    // deal cards
    const initDeal = deal(deck)
    let playerHand = initDeal.playerHand
    let computerHand = initDeal.computerHand

    let computerHandScreen = elt(
      'div',
      'chand',
      elt(
        'h1',
        'counter',
        `Computer Hand Count:`,
        elt('strong', 'ccount', '  ?')
      ),
      elt(
        'div',
        'ccards',
        elt('div', 'card', elt('img', 'cc1')),
        elt('div', 'card', elt('img', 'cc2'))
      )
    )

    let playerHandScreen = elt(
      'div',
      'phand',
      elt(
        'h1',
        'counter',
        'Player Hand Count:',
        elt('strong', 'pcount', `  ${countHand(playerHand)}`)
      ),
      elt(
        'div',
        'pcards',
        elt('div', 'card', elt('img', 'pc1')),
        elt('div', 'card', elt('img', 'pc2'))
      )
    )

    let actionBtns = elt(
      'div',
      'actionbtns',
      elt('button', 'standbtn', elt('h2', '', 'Stand (s)')),
      elt('button', 'hitbtn', elt('h2', '', 'Hit (h)'))
    )

    // function toggleComputerShow() {
    //   document.querySelector('.cc1').classList().toggle('show')
    //   document.querySelector('.chand').firstChild.classList.toggle('show')
    // }

    game.append(computerHandScreen, playerHandScreen, actionBtns)
    document.querySelector('.cc1').src = `./assets/cards/back.svg`
    document.querySelector('.cc2').src = `${getCardPath(computerHand[1])}`
    document.querySelector('.pc1').src = `${getCardPath(playerHand[0])}`
    document.querySelector('.pc2').src = `${getCardPath(playerHand[1])}`

    const standBtn = document.querySelector('.standbtn')
    const hitBtn = document.querySelector('.hitbtn')
    let pCardNumber = 3

    standBtn.addEventListener('click', function (e) {
      stand()
    })
    window.addEventListener('keydown', function (e) {
      if (e.key === 's' && !standBtn.attributes.getNamedItem('disabled'))
        stand()
    })

    hitBtn.addEventListener('click', function (e) {
      hitInGame(playerHand, 'p', pCardNumber++, true)
    })
    window.addEventListener('keydown', function (e) {
      if (e.key === 'h' && !hitBtn.attributes.getNamedItem('disabled'))
        hitInGame(playerHand, 'p', pCardNumber++, true)
    })

    function gameOver() {
      document.querySelector('.cc1').src = getCardPath(computerHand[0])
      document.querySelector('.ccount').textContent = `  ${countHand(
        computerHand
      )}`
      document.querySelector('.hitbtn').setAttribute('disabled', 'disabled')
      document.querySelector('.standbtn').setAttribute('disabled', 'disabled')
      document
        .querySelector('.actionbtns')
        .append(elt('button', 'restartbtn', elt('h2', '', 'Restart (r)')))
      const cResult = countHand(computerHand)
      const pResult = countHand(playerHand)
      let winner

      if (cResult > 21) {
        winner = ['.phand']
      } else if (pResult > 21) {
        winner = ['.chand']
      } else if (cResult > pResult) {
        winner = ['.chand']
      } else if (cResult < pResult) {
        winner = ['.phand']
      } else {
        winner = ['.phand', '.chand']
      }

      for (const w of winner) {
        document.querySelector(w).firstChild.classList.add('winner')
      }

      window.addEventListener('keydown', function (e) {
        if (e.key === 'r' || e.key === 'Enter') this.window.location.reload()
      })

      document
        .querySelector('.restartbtn')
        .addEventListener('click', function (e) {
          window.location.reload()
        })
    }

    function stand() {
      let cValue = countHand(computerHand)
      const pValue = countHand(playerHand)
      let i = 3 //tracking card number
      // condition for computer hitting
      while (cValue <= pValue && cValue <= 17) {
        const newCardRank = hitInGame(computerHand, 'c', i++).rank
        cValue += parseInt(newCardRank)
      }
      gameOver()
    }

    function hitInGame(roleHand, role, cardNumber, check = false) {
      let drawnCard = hit(deck)
      roleHand.push(drawnCard)
      addCardToScreen(drawnCard, role, cardNumber)
      const vNow = countHand(roleHand)
      document.querySelector('.' + role + 'count').textContent = `  ${vNow}`
      if (vNow > 21 && check) gameOver()
      return drawnCard
    }

    /**
     *
     * @param {Object} card
     * @param {String} role p or c
     * @param {Number} cardNumber a number representing the card order
     */
    function addCardToScreen(card, role, cardNumber) {
      const c = elt('div', 'card', elt('img', role + 'c' + cardNumber))
      document.querySelector('.' + role + 'cards').append(c)
      document.querySelector('.' + role + 'c' + cardNumber).src =
        getCardPath(card)
    }
  }
})

const suits = { SPADES: '♠️', HEARTS: '❤️', CLUBS: '♣️', DIAMONDS: '♦️' }
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

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

  for (let i = retDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[retDeck[i], retDeck[j]] = [retDeck[j], retDeck[i]]
  }

  return retDeck
}

function hit(cardsArray) {
  const drawnCard = cardsArray.splice(-1)[0]

  return drawnCard
}

function deal(cardsArray, numHands = 2, cardsPerHand = 2) {
  const retDeck = cardsArray
  const drawnCards = retDeck.splice(-(numHands * cardsPerHand))
  const playerHand = []
  const computerHand = []
  for (let i = 0; i < numHands * cardsPerHand; i++) {
    const cardToPush = drawnCards.splice(-1)
    if (i % 2 !== 0) playerHand.push(cardToPush[0])
    else computerHand.push(cardToPush[0])
  }
  const retObj = {
    deck: retDeck,
    playerHand: playerHand,
    computerHand: computerHand,
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

function elt(type, className = null, ...children) {
  let node = document.createElement(type)
  if (className) node.classList.add(className)
  for (let child of children) {
    if (typeof child != 'string') node.appendChild(child)
    else node.appendChild(document.createTextNode(child))
  }
  return node
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

function getCardPath(card) {
  const suit = getKeyByValue(suits, card.suit)
  let rank = card.rank

  switch (rank) {
    case parseInt(rank):
      break
    case 'J':
      rank = 'jack'
      break
    case 'Q':
      rank = 'queen'
      break
    case 'K':
      rank = 'king'
      break
    case 'A':
      rank = 'ace'
      break
  }

  return ('./assets/cards/' + rank + '_of_' + suit + '.png').toLowerCase()
}

function countHand(initHand) {
  let ranks = initHand.map((e) => e.rank)
  let sum = 0
  let aceCount = 0

  for (const rank of ranks) {
    if (rank === 'A') {
      if (sum <= 10) {
        aceCount++
        sum += 11
      } else {
        sum += 1
      }
    } else if (parseInt(rank)) sum += parseInt(rank)
    else sum += 10
  }

  if (sum > 21) sum -= aceCount * 10

  return sum
}
