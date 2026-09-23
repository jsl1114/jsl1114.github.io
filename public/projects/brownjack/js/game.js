// game.js — wires the rules in blackjack.mjs to the page.
import {
  RANKS,
  SUITS,
  buildDeck,
  dealerShouldHit,
  handValue,
  isBlackjack,
  outcome,
  sameCard,
} from './blackjack.mjs'
import {
  BADGES,
  BONUS,
  CATEGORIES,
  LOSS_POINTS,
  POINTS_PER_DIVISION,
  SHOWCASE_SIZE,
  TIERS,
  WIN_POINTS,
  catchUpBadges,
  newProfile,
  pinBadge,
  rankOf,
  scoreRound,
} from './ranked.mjs'
import { celebrate, celebrateRank, glyphElement, isCelebrating } from './celebrate.mjs'
import { MAX_SAVE_BYTES, exportSave, parseSave, saveFileName } from './save.mjs'
import { buzz, canVibrate, getSettings, play, setSetting } from './sound.mjs'

const $ = (id) => document.getElementById(id)
const el = {
  start: $('start'),
  play: $('play'),
  stack: $('stack'),
  stackCount: $('stack-count'),
  clearStack: $('clear-stack'),
  picker: $('picker'),
  pickerToggle: $('picker-toggle'),
  pickerMenu: $('picker-menu'),
  game: $('game'),
  dealerCounter: $('dealer-counter'),
  dealerCount: $('dealer-count'),
  dealerCards: $('dealer-cards'),
  playerCounter: $('player-counter'),
  playerCount: $('player-count'),
  playerCards: $('player-cards'),
  result: $('result'),
  hit: $('hit'),
  stand: $('stand'),
  again: $('again'),
  toSetup: $('to-setup'),
  emblem: $('emblem'),
  rankName: $('rank-name'),
  rankBar: $('rank-bar'),
  rankMeta: $('rank-meta'),
  notice: $('notice'),
  openBadges: $('open-badges'),
  badgeCount: $('badge-count'),
  rankChip: $('rank-chip'),
  chipEmblem: $('chip-emblem'),
  chipName: $('chip-name'),
  chipRp: $('chip-rp'),
  chipBar: $('chip-bar'),
  chipNext: $('chip-next'),
  roundScore: $('round-score'),
  badgesDialog: $('badges-dialog'),
  closeBadges: $('close-badges'),
  stats: $('stats'),
  badgeSections: $('badge-sections'),
  showcaseHint: $('showcase-hint'),
  showcase: $('showcase'),
  chipShowcase: $('chip-showcase'),
  pointsTable: $('points-table'),
  bonusList: $('bonus-list'),
  resetProgress: $('reset-progress'),
  openSettings: $('open-settings'),
  settingsDialog: $('settings-dialog'),
  closeSettings: $('close-settings'),
  exportSave: $('export-save'),
  chooseSave: $('choose-save'),
  saveFile: $('save-file'),
  importPreview: $('import-preview'),
  importSummary: $('import-summary'),
  confirmImport: $('confirm-import'),
  cancelImport: $('cancel-import'),
  settingsStatus: $('settings-status'),
  settingSound: $('setting-sound'),
  settingHaptics: $('setting-haptics'),
  hapticsRow: $('haptics-row'),
}

const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }
const RANK_NAMES = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' }
const DEAL_LABELS = ['You', 'Dealer', 'You', 'Dealer ↓']

const state = {
  stacked: [],
  deck: [],
  player: [],
  dealer: [],
  done: true,
  // The dealer's reveal is playing out; `skipping` fast-forwards it.
  revealing: false,
  skipping: false,
  ranked: false,
  riskyHit: false,
  needle: false,
}

const cardPath = ({ rank, suit }) =>
  `./assets/cards/${RANK_NAMES[rank] ?? rank}_of_${suit}.png`
const cardName = ({ rank, suit }) => `${RANK_NAMES[rank] ?? rank} of ${suit}`

function cardElement(card, faceDown = false) {
  const wrapper = document.createElement('div')
  const img = document.createElement('img')
  if (!faceDown) {
    wrapper.className = 'card'
    img.src = cardPath(card)
    img.alt = cardName(card)
    wrapper.append(img)
    return wrapper
  }
  // Face down: a back and a blank face that turns over when revealed. The face
  // image is only set at the reveal, so the page never holds the hole card early.
  wrapper.className = 'card down'
  const inner = document.createElement('div')
  inner.className = 'card-inner'
  img.className = 'card-back'
  img.src = './assets/cards/back.svg'
  img.alt = 'Face-down card'
  const face = document.createElement('img')
  face.className = 'card-face'
  face.alt = ''
  inner.append(img, face)
  wrapper.append(inner)
  return wrapper
}

// ---- Setup: stacking the deck ----------------------------------------------

function renderStack() {
  el.stack.replaceChildren(
    ...state.stacked.map((card, index) => {
      const item = document.createElement('li')
      item.className = 'stack-item'
      const img = document.createElement('img')
      img.src = cardPath(card)
      img.alt = cardName(card)
      const label = document.createElement('span')
      label.textContent = DEAL_LABELS[index] ?? `Draw ${index + 1}`
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'remove'
      remove.textContent = '×'
      remove.setAttribute('aria-label', `Remove ${cardName(card)}`)
      remove.addEventListener('click', () => {
        state.stacked.splice(index, 1)
        renderStack()
        renderPicker()
      })
      item.append(img, label, remove)
      return item
    }),
  )
  el.stackCount.textContent = state.stacked.length || ''
  el.clearStack.hidden = state.stacked.length === 0
}

const isStacked = (card) => state.stacked.some((s) => sameCard(s, card))
const suitsLeft = (rank) => SUITS.filter((suit) => !isStacked({ rank, suit }))

function pickerButton(className, content, onClick, disabled = false) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.disabled = disabled
  button.append(...content)
  button.addEventListener('click', onClick)
  return button
}

// Two layers: pick a rank, then one of that rank's remaining suits.
function renderPicker(rank = null) {
  const head = document.createElement('div')
  head.className = 'picker-head'
  const grid = document.createElement('div')

  if (rank === null) {
    head.textContent = 'Pick a rank'
    grid.className = 'rank-grid'
    grid.append(
      ...RANKS.map((r) =>
        pickerButton('rank', [r], () => renderPicker(r), suitsLeft(r).length === 0),
      ),
    )
  } else {
    head.append(
      pickerButton('back', ['‹'], () => renderPicker()),
      `Pick a suit for ${rank}`,
    )
    head.firstChild.setAttribute('aria-label', 'Back to ranks')
    grid.className = 'suit-grid'
    grid.append(
      ...SUITS.map((suit) => {
        const symbol = document.createElement('span')
        symbol.className = 'symbol'
        symbol.textContent = SUIT_SYMBOLS[suit]
        const red = suit === 'hearts' || suit === 'diamonds'
        return pickerButton(
          `suit${red ? ' red' : ''}`,
          [symbol, suit],
          () => {
            state.stacked.push({ rank, suit })
            renderStack()
            renderPicker()
          },
          isStacked({ rank, suit }),
        )
      }),
    )
  }

  el.pickerMenu.replaceChildren(head, grid)
  if (!el.pickerMenu.hidden) el.pickerMenu.querySelector('button:not(:disabled)')?.focus()
}

function openPicker() {
  el.pickerMenu.hidden = false
  el.pickerToggle.setAttribute('aria-expanded', 'true')
  renderPicker()
}

function closePicker({ restoreFocus = false } = {}) {
  if (el.pickerMenu.hidden) return
  el.pickerMenu.hidden = true
  el.pickerToggle.setAttribute('aria-expanded', 'false')
  if (restoreFocus) el.pickerToggle.focus()
}

// ---- Ranked profile (localStorage only) -------------------------------------

const PROFILE_KEY = 'brownjack.profile.v1'
// Set while a ranked hand is on the table, so leaving mid-hand counts as a loss.
const ROUND_KEY = 'brownjack.round-in-progress'

function readStorage(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

// Returns whether the write stuck.
function writeStorage(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
    return true
  } catch {
    // Storage can be unavailable (private mode, blocked site data); play on without saving.
    return false
  }
}

function loadProfile() {
  try {
    const saved = JSON.parse(readStorage(PROFILE_KEY))
    if (saved && Number.isFinite(saved.rp)) return { ...newProfile(), ...saved }
  } catch {
    // Fall through to a fresh profile.
  }
  return newProfile()
}

let profile = loadProfile()
const saveProfile = () => writeStorage(PROFILE_KEY, JSON.stringify(profile))

const badgeById = (id) => BADGES.find((badge) => badge.id === id)
// Ranked hands played since the page loaded, for the Marathon badge.
let sessionHands = 0

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0')

function renderEmblem(node, rank) {
  node.dataset.tier = rank.tier.toLowerCase()
  node.textContent = rank.division ?? `★${rank.stars}`
}

function renderRank() {
  const rank = rankOf(profile.rp)
  renderEmblem(el.emblem, rank)
  el.rankName.textContent = rank.name
  el.rankBar.style.width = `${rank.progress}%`
  el.rankMeta.textContent = `${rank.progress} / ${POINTS_PER_DIVISION} RP${
    rank.tier === 'Legend' ? ' to next star' : ''
  } · ${profile.wins}W ${profile.losses}L ${profile.pushes}P`
  el.badgeCount.textContent = `${Object.keys(profile.badges).length}/${BADGES.length}`
  renderShowcase(el.showcase)
}

// The badges a player pinned, shown beside their rank.
function renderShowcase(container) {
  const pinned = (profile.showcase ?? []).map(badgeById).filter(Boolean)
  container.replaceChildren(
    ...pinned.map((badge) => {
      const earned = profile.badges[badge.id]
      const item = document.createElement('span')
      item.className = `showcase-item ${badge.rarity.toLowerCase()}`
      // Focusable so keyboard and touch users can open the tooltip too.
      item.tabIndex = 0
      item.setAttribute('role', 'img')
      item.setAttribute('aria-label', `${badge.name}, ${badge.rarity}: ${badge.desc}`)
      const tip = document.createElement('span')
      tip.className = 'tooltip'
      tip.setAttribute('aria-hidden', 'true')
      const name = document.createElement('strong')
      name.textContent = badge.name
      const meta = document.createElement('small')
      meta.textContent = `${badge.rarity} · ${badge.category}`
      const desc = document.createElement('span')
      desc.textContent = badge.desc
      const count = document.createElement('small')
      count.textContent = badge.once || earned.count === 1 ? `Earned ${new Date(earned.first).toLocaleDateString()}` : `Earned ${earned.count}×`
      tip.append(name, meta, desc, count)
      item.append(glyphElement(badge), tip)
      return item
    }),
  )
  container.setAttribute('aria-label', `Showcase: ${pinned.map((b) => b.name).join(', ')}`)
  container.hidden = pinned.length === 0
}

let chipBarTimer

// Fill the bar toward the new value. Crossing into another division, run it to
// the end (or the start) first so a promotion never looks like a drop.
function animateChipBar(fromRp, toRp) {
  const bar = el.chipBar
  const width = (rp) => `${rankOf(rp).progress}%`
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  clearTimeout(chipBarTimer)
  if (fromRp === null || step(fromRp) === step(toRp)) {
    bar.style.width = width(toRp)
    return
  }
  const promoted = step(toRp) > step(fromRp)
  bar.style.width = promoted ? '100%' : '0%'
  chipBarTimer = setTimeout(() => {
    bar.style.transition = 'none'
    bar.style.width = promoted ? '0%' : '100%'
    void bar.offsetWidth // commit the jump before animating again
    bar.style.transition = ''
    bar.style.width = width(toRp)
  }, 450)
}

function renderRankChip(fromRp = null) {
  el.rankChip.classList.toggle('practice', !state.ranked)
  if (!state.ranked) {
    el.chipName.textContent = 'Practice'
    el.chipRp.textContent = ''
    el.chipNext.textContent = 'Rigged game · no RP won or lost'
    return
  }
  const rank = rankOf(profile.rp)
  renderEmblem(el.chipEmblem, rank)
  el.chipName.textContent = rank.name
  el.chipRp.textContent = `${rank.progress} / ${POINTS_PER_DIVISION} RP`
  const next = rankOf(profile.rp - rank.progress + POINTS_PER_DIVISION)
  el.chipNext.textContent = `${POINTS_PER_DIVISION - rank.progress} RP to ${next.name}`
  renderShowcase(el.chipShowcase)
  animateChipBar(fromRp, profile.rp)
}

function rankChangeText(before, after, beforeRp, afterRp) {
  if (before.tier === 'Legend' && after.tier === 'Legend') {
    if (after.stars > before.stars) return ['up', `New star! ${after.name}`]
    if (after.stars < before.stars) return ['down', `Lost a star · ${after.name}`]
    return null
  }
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  if (step(afterRp) > step(beforeRp)) return ['up', `Promoted to ${after.name}`]
  if (step(afterRp) < step(beforeRp)) return ['down', `Demoted to ${after.name}`]
  return null
}

function renderRoundScore(result, beforeRp) {
  if (result.unranked) {
    const span = document.createElement('span')
    span.className = 'score-line'
    span.textContent = 'Rigged game · no RP won or lost'
    el.roundScore.replaceChildren(span)
    el.roundScore.hidden = false
    return
  }
  const pieces = result.lines.map((line) => {
    const span = document.createElement('span')
    span.className = 'score-line'
    span.textContent = `${line.label} ${signed(line.points)}`
    return span
  })
  const total = document.createElement('strong')
  total.className = 'score-total'
  const floored = result.delta !== result.lines.reduce((sum, line) => sum + line.points, 0)
  total.textContent = `${signed(result.delta)} RP${floored ? " (can't go lower)" : ''}`
  pieces.push(total)
  const change = rankChangeText(result.before, result.after, beforeRp, result.profile.rp)
  if (change) {
    const span = document.createElement('span')
    span.className = `rank-change ${change[0]}`
    span.textContent = change[1]
    pieces.push(span)
  }
  el.roundScore.replaceChildren(...pieces)
  el.roundScore.hidden = false
}

function renderBadgesDialog() {
  const rank = rankOf(profile.rp)
  const decided = profile.wins + profile.losses
  const stats = [
    ['Rank', rank.name],
    ['Peak', rankOf(profile.peakRp).name],
    ['Hands', profile.games],
    ['Win rate', decided ? `${Math.round((100 * profile.wins) / decided)}%` : '—'],
    ['Best streak', profile.bestStreak],
    ['Blackjacks', profile.blackjacks],
  ]
  el.stats.replaceChildren(
    ...stats.map(([label, value]) => {
      const row = document.createElement('div')
      const dt = document.createElement('dt')
      dt.textContent = label
      const dd = document.createElement('dd')
      dd.textContent = value
      row.append(dt, dd)
      return row
    }),
  )

  const showcase = profile.showcase ?? []
  el.showcaseHint.textContent = `Pin up to ${SHOWCASE_SIZE} earned badges to show beside your rank · ${showcase.length}/${SHOWCASE_SIZE} pinned`
  el.badgeSections.replaceChildren(
    ...CATEGORIES.map((category) => {
      const badges = BADGES.filter((badge) => badge.category === category)
      const section = document.createElement('section')
      section.className = 'badge-section'
      const heading = document.createElement('h3')
      const count = document.createElement('span')
      count.textContent = `${badges.filter((b) => profile.badges[b.id]).length}/${badges.length}`
      heading.append(category, count)
      const grid = document.createElement('ul')
      grid.className = 'badge-grid'
      grid.append(...badges.map(badgeItem))
      section.append(heading, grid)
      return section
    }),
  )

  el.pointsTable.replaceChildren(
    ...[...TIERS, 'Legend'].map((tier, i) => {
      const row = document.createElement('tr')
      for (const value of [tier, `+${WIN_POINTS[i]}`, `−${LOSS_POINTS[i]}`]) {
        const cell = document.createElement('td')
        cell.textContent = value
        row.append(cell)
      }
      return row
    }),
  )
  el.bonusList.textContent =
    `Bonuses on a win: blackjack +${BONUS.blackjack}, daredevil (you hit on a hard 17 or more) ` +
    `+${BONUS.daredevil}, five-card Charlie +${BONUS.charlie}, and +${BONUS.streakStep} per win ` +
    `past the second in a row (up to +${BONUS.streakCap}).`
}

function badgeItem(badge) {
  const earned = profile.badges[badge.id]
  const showcase = profile.showcase ?? []
  const item = document.createElement('li')
  item.className = `badge ${badge.rarity.toLowerCase()}${earned ? ' earned' : ''}`
  const name = document.createElement('strong')
  name.textContent = badge.name
  const rarity = document.createElement('small')
  rarity.className = 'rarity'
  rarity.textContent = badge.rarity
  const desc = document.createElement('p')
  desc.textContent = badge.desc
  const status = document.createElement('small')
  status.className = 'status'
  const goal = badge.goal?.(profile)
  status.textContent = earned
    ? `Earned ${badge.once ? '' : `${earned.count}× · `}${new Date(earned.first).toLocaleDateString()}`
    : goal
      ? `Locked · ${goal[0]} / ${goal[1]}`
      : 'Locked'
  item.append(glyphElement(badge), name, rarity, desc, status)

  if (earned) {
    const pinned = showcase.includes(badge.id)
    const pin = document.createElement('button')
    pin.type = 'button'
    pin.className = 'pin'
    pin.dataset.pin = badge.id
    pin.setAttribute('aria-pressed', String(pinned))
    pin.textContent = pinned ? '★ Pinned' : '☆ Pin'
    pin.disabled = !pinned && showcase.length >= SHOWCASE_SIZE
    if (pin.disabled) pin.title = 'Your showcase is full: unpin a badge first'
    pin.addEventListener('click', () => togglePin(badge.id))
    item.append(pin)
  }
  return item
}

function togglePin(id) {
  const result = pinBadge(profile, id)
  profile = result.profile
  saveProfile()
  renderRank()
  renderBadgesDialog()
  el.badgeSections.querySelector(`[data-pin="${id}"]`)?.focus()
  for (const earned of result.earned) celebrate(badgeById(earned))
}

// ---- The round -------------------------------------------------------------

function draw(hand, container, faceDown = false) {
  const card = state.deck.pop()
  hand.push(card)
  container.append(cardElement(card, faceDown))
}

function updateCounts() {
  el.playerCount.textContent = handValue(state.player).total
}

// ---- Dealer reveal pacing ----------------------------------------------------
// A hand is settled (and saved) the moment it ends; the reveal only plays out
// what already happened, so leaving mid-reveal can't dodge or forfeit a result.

const PACE = { flip: 450, draw: 650, settle: 350 }
let endPause = null

// Wait `ms`, unless the player skips ahead.
function pause(ms) {
  if (state.skipping) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms)
    function done() {
      clearTimeout(timer)
      endPause = null
      resolve()
    }
    endPause = done
  })
}

function skipReveal() {
  if (!state.revealing) return
  state.skipping = true
  endPause?.()
}

const showDealerTotal = (cards) => {
  el.dealerCount.textContent = handValue(state.dealer.slice(0, cards)).total
}

// Turn the dealer's hole card (always the second card) face up.
async function revealHoleCard() {
  const hole = el.dealerCards.querySelector('.card.down:not(.flipped)')
  if (!hole) return
  const face = hole.querySelector('.card-face')
  face.src = cardPath(state.dealer[1])
  face.alt = cardName(state.dealer[1])
  hole.querySelector('.card-back').alt = ''
  // Flip onto a loaded image rather than a blank one.
  await face.decode().catch(() => {})
  if (state.skipping) hole.classList.add('instant')
  else play('flip')
  hole.classList.add('flipped')
}

async function playDealerReveal() {
  state.revealing = true
  state.skipping = false
  el.result.textContent = handValue(state.player).total > 21 ? 'Bust…' : 'Dealer’s turn…'
  el.result.classList.add('pending')
  await pause(PACE.flip)
  await revealHoleCard()
  showDealerTotal(2)
  for (let i = el.dealerCards.children.length; i < state.dealer.length; i++) {
    await pause(PACE.draw)
    el.dealerCards.append(cardElement(state.dealer[i]))
    if (!state.skipping) play('deal')
    showDealerTotal(i + 1)
  }
  await pause(PACE.settle)
  el.result.classList.remove('pending')
  state.revealing = false
}

function startRound() {
  closePicker()
  Object.assign(state, {
    deck: buildDeck(state.stacked),
    player: [],
    dealer: [],
    done: false,
    ranked: state.stacked.length === 0,
    riskyHit: false,
    needle: false,
  })
  if (state.ranked) writeStorage(ROUND_KEY, '1')
  el.notice.hidden = true
  el.roundScore.hidden = true
  renderRankChip()
  el.playerCards.replaceChildren()
  el.dealerCards.replaceChildren()
  el.result.textContent = ''
  el.dealerCount.textContent = '?'
  el.playerCounter.classList.remove('winner')
  el.dealerCounter.classList.remove('winner')
  el.hit.hidden = el.stand.hidden = false
  el.again.hidden = el.toSetup.hidden = true

  el.start.hidden = true
  el.game.hidden = false

  draw(state.player, el.playerCards)
  draw(state.dealer, el.dealerCards)
  draw(state.player, el.playerCards)
  draw(state.dealer, el.dealerCards, true)
  for (let i = 0; i < 4; i++) play('deal', { at: i * 0.08 })
  updateCounts()
  el.hit.focus()

  if (isBlackjack(state.player) || isBlackjack(state.dealer)) finish()
}

function hit() {
  if (state.done) return
  const before = handValue(state.player)
  draw(state.player, el.playerCards)
  play('deal')
  updateCounts()
  const { total } = handValue(state.player)
  if (!before.soft && before.total >= 17) {
    state.riskyHit = true
    if (before.total >= 18 && total === 21) state.needle = true
  }
  if (total > 21) finish()
  else if (total === 21) stand()
}

// The dealer plays out in state now; the table shows it card by card after.
function stand() {
  if (state.done) return
  while (dealerShouldHit(state.dealer)) state.dealer.push(state.deck.pop())
  finish()
}

function resultText(winner) {
  const player = handValue(state.player).total
  const dealer = handValue(state.dealer).total
  if (winner === 'push') return 'Push — nobody wins'
  if (winner === 'player') {
    if (isBlackjack(state.player)) return 'Blackjack! You win'
    return dealer > 21 ? 'Dealer busts — you win!' : 'You win!'
  }
  if (player > 21) return 'Bust — dealer wins'
  return isBlackjack(state.dealer) ? 'Dealer has blackjack' : 'Dealer wins'
}

// Settle and save the hand straight away, then play the dealer's reveal.
function finish() {
  state.done = true
  el.hit.hidden = el.stand.hidden = true
  updateCounts()

  const winner = outcome(state.player, state.dealer)
  const beforeRp = profile.rp
  if (state.ranked) sessionHands++
  const result = scoreRound(profile, {
    winner,
    player: state.player,
    dealer: state.dealer,
    riskyHit: state.riskyHit,
    needle: state.needle,
    stacked: !state.ranked,
    at: Date.now(),
    sessionHands,
  })
  if (!result.unranked) {
    profile = result.profile
    saveProfile()
    writeStorage(ROUND_KEY, null)
  }
  playDealerReveal().then(() => showResult(winner, result, beforeRp))
}

function showResult(winner, result, beforeRp) {
  el.result.textContent = resultText(winner)
  const sting =
    winner === 'push' ? 'push'
    : winner === 'player' ? (isBlackjack(state.player) ? 'blackjack' : 'win')
    : handValue(state.player).total > 21 ? 'bust' : 'lose'
  play(sting)
  if (sting === 'bust' || sting === 'blackjack' || sting === 'win') buzz(sting)
  if (winner !== 'dealer') el.playerCounter.classList.add('winner')
  if (winner !== 'player') el.dealerCounter.classList.add('winner')
  renderRankChip(beforeRp)
  renderRoundScore(result, beforeRp)

  el.again.hidden = el.toSetup.hidden = false
  // Focus first: a celebration takes focus and hands it back when it closes.
  el.again.focus()
  // A promotion (or a new Legend star) plays first, then the hand's badges.
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  if (!result.unranked && step(result.profile.rp) > step(beforeRp)) celebrateRank(result.before, result.after)
  for (const id of result.earned) celebrate(badgeById(id))
}

function showSetup() {
  state.done = true
  el.game.hidden = true
  el.start.hidden = false
  renderRank()
  el.play.focus()
}

// ---- Input -----------------------------------------------------------------

el.play.addEventListener('click', startRound)
el.again.addEventListener('click', startRound)
el.toSetup.addEventListener('click', showSetup)
el.hit.addEventListener('click', hit)
el.stand.addEventListener('click', stand)
// pointerdown, not click: the click on Stand that starts a reveal mustn't skip it.
el.game.addEventListener('pointerdown', skipReveal)
el.clearStack.addEventListener('click', () => {
  state.stacked = []
  renderStack()
  renderPicker()
})
el.pickerToggle.addEventListener('click', () =>
  el.pickerMenu.hidden ? openPicker() : closePicker(),
)
document.addEventListener('pointerdown', (event) => {
  if (!el.picker.contains(event.target)) closePicker()
})

el.openBadges.addEventListener('click', () => {
  renderBadgesDialog()
  el.badgesDialog.showModal()
})
el.closeBadges.addEventListener('click', () => el.badgesDialog.close())
// A click on the backdrop lands on the dialog element itself.
el.badgesDialog.addEventListener('click', (event) => {
  if (event.target === el.badgesDialog) el.badgesDialog.close()
})

// ---- Settings: export, import and reset -------------------------------------

let pendingImport = null

function setStatus(message, kind = 'ok') {
  el.settingsStatus.textContent = message
  el.settingsStatus.dataset.kind = kind
}

function clearImport() {
  pendingImport = null
  el.importPreview.hidden = true
  el.saveFile.value = ''
}

function disarmReset() {
  delete el.resetProgress.dataset.armed
  el.resetProgress.textContent = 'Reset progress'
}

const describe = (p) => {
  const badges = Object.keys(p.badges).length
  return `${rankOf(p.rp).name}, ${badges} badge${badges === 1 ? '' : 's'}, ${p.games} hand${p.games === 1 ? '' : 's'}`
}

el.openSettings.addEventListener('click', () => {
  const prefs = getSettings()
  el.settingSound.checked = prefs.sound
  el.settingHaptics.checked = prefs.haptics
  el.hapticsRow.hidden = !canVibrate()
  clearImport()
  disarmReset()
  setStatus('')
  el.settingsDialog.showModal()
})
el.closeSettings.addEventListener('click', () => el.settingsDialog.close())
el.settingsDialog.addEventListener('click', (event) => {
  if (event.target === el.settingsDialog) el.settingsDialog.close()
})
el.settingsDialog.addEventListener('close', () => {
  clearImport()
  disarmReset()
})

el.settingSound.addEventListener('change', () => {
  setSetting('sound', el.settingSound.checked)
  if (el.settingSound.checked) play('common')
})
el.settingHaptics.addEventListener('change', () => {
  setSetting('haptics', el.settingHaptics.checked)
  if (el.settingHaptics.checked) buzz('win')
})

el.exportSave.addEventListener('click', () => {
  try {
    const url = URL.createObjectURL(new Blob([exportSave(profile)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = saveFileName()
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus(`Downloaded ${link.download} (${describe(profile)}).`)
  } catch {
    setStatus("Couldn't create the save file in this browser.", 'error')
  }
})

el.chooseSave.addEventListener('click', () => {
  clearImport()
  el.saveFile.click()
})

el.saveFile.addEventListener('change', async () => {
  const file = el.saveFile.files?.[0]
  if (!file) return
  if (file.size > MAX_SAVE_BYTES) {
    clearImport()
    setStatus('That file is too large to be a BrownJack save.', 'error')
    return
  }
  let text
  try {
    text = await file.text()
  } catch {
    clearImport()
    setStatus("Couldn't read that file.", 'error')
    return
  }
  const result = parseSave(text)
  if (result.error) {
    clearImport()
    setStatus(result.error, 'error')
    return
  }
  pendingImport = result
  const exported = result.exportedAt ? `, saved ${new Date(result.exportedAt).toLocaleDateString()}` : ''
  el.importSummary.textContent =
    `${file.name}: ${describe(result.profile)}${exported}. ` +
    `Importing replaces your current progress (${describe(profile)}) and can't be undone, ` +
    'so download a save file first if you want to keep it.'
  el.importPreview.hidden = false
  setStatus('')
  el.confirmImport.focus()
})

el.cancelImport.addEventListener('click', () => {
  clearImport()
  setStatus('Import cancelled. Nothing changed.')
  el.chooseSave.focus()
})

el.confirmImport.addEventListener('click', () => {
  if (!pendingImport) return
  const caughtUp = catchUpBadges(pendingImport.profile)
  profile = caughtUp.profile
  // A save from another device can't have a hand in progress here.
  writeStorage(ROUND_KEY, null)
  const stored = saveProfile()
  clearImport()
  renderRank()
  setStatus(
    stored
      ? `Save imported: ${describe(profile)}.`
      : "Save loaded, but this browser isn't letting the game store data, so it will be gone when you close the page.",
    stored ? 'ok' : 'error',
  )
  el.chooseSave.focus()
  for (const id of caughtUp.earned) celebrate(badgeById(id))
})

// Two clicks to reset, so a stray tap can't wipe a Legend.
el.resetProgress.addEventListener('click', () => {
  if (!el.resetProgress.dataset.armed) {
    el.resetProgress.dataset.armed = 'true'
    el.resetProgress.textContent = 'Click again to erase your rank and badges'
    return
  }
  profile = newProfile()
  saveProfile()
  renderRank()
  disarmReset()
  setStatus('Progress reset.')
})

window.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
  if (el.badgesDialog.open || el.settingsDialog.open || isCelebrating()) return
  // During the dealer's reveal any key skips to the result.
  if (state.revealing) {
    if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(event.key)) skipReveal()
    return
  }

  if (!el.pickerMenu.hidden) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    // Escape steps back a layer before closing.
    if (el.pickerMenu.querySelector('.suit-grid')) renderPicker()
    else closePicker({ restoreFocus: true })
    return
  }

  // Let Enter activate whatever button or control has focus.
  const onControl = event.target.closest?.('button, summary, a, input')
  const key = event.key.toLowerCase()

  if (!el.start.hidden) {
    if (key === 'enter' && !onControl) startRound()
  } else if (!state.done) {
    if (key === 'h') hit()
    if (key === 's') stand()
  } else if (key === 'r' || (key === 'enter' && !onControl)) {
    startRound()
  }
})

if (readStorage(ROUND_KEY)) {
  const result = scoreRound(profile, { winner: 'dealer', forfeit: true })
  profile = result.profile
  saveProfile()
  writeStorage(ROUND_KEY, null)
  el.notice.textContent = `Your last ranked hand was left unfinished and counted as a loss (${signed(result.delta)} RP).`
  el.notice.hidden = false
}

const caughtUp = catchUpBadges(profile)
if (caughtUp.earned.length) {
  profile = caughtUp.profile
  saveProfile()
}

renderStack()
renderRank()
for (const id of caughtUp.earned) celebrate(badgeById(id))
