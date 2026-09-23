// game.js — wires the rules in blackjack.mjs to the page.
import {
  RANKS,
  SUITS,
  CUT_CARD,
  buildDeck,
  canSplit,
  createShoe,
  dealerShouldHit,
  handValue,
  isBlackjack,
  needsShuffle,
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
import { buzz, canVibrate, play } from './sound.mjs'
import { getSettings, setSetting } from './prefs.mjs'
import { bestMove, describeSpot } from './strategy.mjs'
import { CARD_BACKS, TABLES, isUnlocked, selected, unlockTier, unlocksAt } from './cosmetics.mjs'

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
  playerHands: $('player-hands'),
  result: $('result'),
  hit: $('hit'),
  stand: $('stand'),
  double: $('double'),
  split: $('split'),
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
  shoe: $('shoe'),
  shoeFill: $('shoe-fill'),
  shoeCut: $('shoe-cut'),
  shoeLeft: $('shoe-left'),
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
  settingCoach: $('setting-coach'),
  tablePicker: $('table-picker'),
  backPicker: $('back-picker'),
  coach: $('coach'),
}

const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }
const RANK_NAMES = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' }
const DEAL_LABELS = ['You', 'Dealer', 'You', 'Dealer ↓']

const state = {
  stacked: [],
  deck: [],
  // The player's hands: one, or two after a split. Each is
  // { cards, doubled, done, fromAces, riskyHit, needle, view }.
  hands: [],
  active: 0,
  dealer: [],
  done: true,
  // The dealer's reveal is playing out; `skipping` fast-forwards it.
  revealing: false,
  skipping: false,
  ranked: false,
  // The six-deck shoe ranked hands deal from. Kept in memory only: a reload is
  // a new table, and storing it would let anyone read the upcoming cards.
  shoe: null,
  firstInShoe: false,
  // One entry per hit/stand choice: did it match basic strategy?
  decisions: [],
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
  img.src = `./assets/cards/${currentBack().file}`
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
// Best-ever RP before the current hand, to spot a first time in a tier.
let beforePeak = 0

// ---- Cosmetics -----------------------------------------------------------------

const peakTier = () => rankOf(profile.peakRp).tierIndex
const currentBack = () => selected(CARD_BACKS, getSettings().cardBack, peakTier())

function applyTable() {
  document.documentElement.dataset.table = selected(TABLES, getSettings().table, peakTier()).id
}

function renderCosmetics() {
  const tier = peakTier()
  const picker = (container, list, key, current) =>
    container.replaceChildren(
      ...list.map((item) => {
        const unlocked = isUnlocked(item, tier)
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'swatch'
        button.disabled = !unlocked
        button.setAttribute('aria-pressed', String(item.id === current.id))
        const preview = document.createElement('span')
        preview.className = 'swatch-preview'
        if (key === 'table') preview.dataset.table = item.id
        else preview.style.backgroundImage = `url('./assets/cards/${item.file}')`
        const label = document.createElement('span')
        label.textContent = unlocked ? item.name : `🔒 ${unlockTier(item)}`
        button.title = unlocked ? item.name : `${item.name}: reach ${unlockTier(item)} to unlock`
        button.append(preview, label)
        button.addEventListener('click', () => {
          setSetting(key, item.id)
          applyTable()
          renderCosmetics()
          container.querySelector('[aria-pressed="true"]')?.focus()
        })
        return button
      }),
    )
  picker(el.tablePicker, TABLES, 'table', selected(TABLES, getSettings().table, tier))
  picker(el.backPicker, CARD_BACKS, 'cardBack', currentBack())
}

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
    ['Strategy', profile.decisions ? `${Math.round((100 * profile.goodDecisions) / profile.decisions)}%` : '—'],
    ['Best textbook run', profile.bestTextbookStreak],
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
    `past the second in a row (up to +${BONUS.streakCap}). Doubling down puts twice the RP at stake ` +
    'either way, and after a split each hand wins or loses on its own.'
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

const activeHand = () => state.hands[state.active]
const newHand = (cards = []) => ({ cards, doubled: false, done: false, fromAces: false, riskyHit: false, needle: false, view: null })
const isBust = (hand) => handValue(hand.cards).total > 21
// Bets at risk: a doubled hand counts two. Stored so leaving mid-hand costs it all.
const stake = () => state.hands.reduce((sum, hand) => sum + (hand.doubled ? 2 : 1), 0)

function dealDealer(faceDown = false) {
  const card = state.deck.pop()
  state.dealer.push(card)
  el.dealerCards.append(cardElement(card, faceDown))
}

function drawTo(hand, { sound = true } = {}) {
  const card = state.deck.pop()
  hand.cards.push(card)
  hand.view?.cards.append(cardElement(card))
  if (sound) play('deal')
}

// Build a view (counter + cards) for each hand. Rebuilt only when a split
// changes the hands, so cards already on the table don't re-deal.
function buildHandViews() {
  const split = state.hands.length > 1
  el.playerHands.classList.toggle('split', split)
  el.playerHands.replaceChildren(
    ...state.hands.map((hand, i) => {
      const block = document.createElement('div')
      block.className = 'hand player-hand'
      const counter = document.createElement('h2')
      counter.className = 'counter'
      const count = document.createElement('strong')
      count.className = 'count'
      const tag = document.createElement('span')
      tag.className = 'hand-tag'
      counter.append(split ? `Hand ${i + 1} ` : 'You ', count, tag)
      const cards = document.createElement('div')
      cards.className = 'cards'
      cards.append(...hand.cards.map((card) => cardElement(card)))
      block.append(counter, cards)
      hand.view = { block, counter, count, tag, cards }
      return block
    }),
  )
}

function updateCounts() {
  state.hands.forEach((hand, i) => {
    hand.view.count.textContent = handValue(hand.cards).total
    hand.view.tag.textContent = hand.doubled ? '2×' : ''
    hand.view.block.classList.toggle('active', !state.done && state.hands.length > 1 && i === state.active)
  })
}

const canDoubleNow = () => {
  const hand = activeHand()
  return !state.done && hand.cards.length === 2 && !hand.fromAces
}
const canSplitNow = () => !state.done && state.hands.length === 1 && canSplit(activeHand().cards)

function updateActions() {
  el.hit.hidden = el.stand.hidden = state.done
  el.double.hidden = !canDoubleNow()
  el.split.hidden = !canSplitNow()
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
  el.result.textContent = state.hands.every(isBust) ? 'Bust…' : 'Dealer’s turn…'
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
  renderShoe()
  await pause(PACE.settle)
  el.result.classList.remove('pending')
  state.revealing = false
}

function renderShoe() {
  el.shoe.hidden = !state.ranked
  if (!state.ranked) return
  const { cards, size } = state.shoe
  el.shoeFill.style.width = `${(100 * cards.length) / size}%`
  el.shoeCut.style.left = `${100 * (1 - CUT_CARD)}%`
  el.shoeLeft.textContent = `${cards.length} cards left`
}

function startRound() {
  closePicker()
  const ranked = state.stacked.length === 0
  // A rigged game deals its own stacked deck and leaves the shoe alone.
  const newShoe = ranked && needsShuffle(state.shoe)
  if (newShoe) state.shoe = createShoe()
  Object.assign(state, {
    deck: ranked ? state.shoe.cards : buildDeck(state.stacked),
    firstInShoe: newShoe,
    decisions: [],
    hands: [newHand()],
    active: 0,
    dealer: [],
    done: false,
    ranked,
  })
  if (state.ranked) writeStorage(ROUND_KEY, '1')
  el.notice.hidden = true
  el.roundScore.hidden = true
  renderRankChip()
  el.dealerCards.replaceChildren()
  el.result.textContent = ''
  el.dealerCount.textContent = '?'
  el.coach.hidden = true
  el.dealerCounter.classList.remove('winner')
  el.again.hidden = el.toSetup.hidden = true

  el.start.hidden = true
  el.game.hidden = false

  const [hand] = state.hands
  buildHandViews()
  drawTo(hand, { sound: false })
  dealDealer()
  drawTo(hand, { sound: false })
  dealDealer(true)
  if (newShoe) {
    play('shuffle')
    el.result.textContent = 'New shoe shuffled'
  }
  for (let i = 0; i < 4; i++) play('deal', { at: newShoe ? 0.5 + i * 0.08 : i * 0.08 })
  renderShoe()
  updateCounts()
  updateActions()
  el.hit.focus()

  if (isBlackjack(hand.cards) || isBlackjack(state.dealer)) finish()
}

// Check a choice against basic strategy, and have the coach say so if it's on.
function recordDecision(move) {
  const { cards } = activeHand()
  const options = { canDouble: canDoubleNow(), canSplit: canSplitNow() }
  const best = bestMove(cards, state.dealer[0], options)
  const correct = move === best
  state.decisions.push(correct)
  if (!getSettings().coach) return
  const spot = describeSpot(cards, state.dealer[0], { pair: options.canSplit })
  el.coach.textContent = correct ? `✓ Textbook: ${move} on ${spot}` : `✗ Basic strategy says ${best} on ${spot}`
  el.coach.dataset.correct = String(correct)
  el.coach.hidden = false
}

function hit() {
  if (state.done) return
  const hand = activeHand()
  recordDecision('hit')
  const before = handValue(hand.cards)
  drawTo(hand)
  el.result.textContent = ''
  const { total } = handValue(hand.cards)
  if (!before.soft && before.total >= 17) {
    hand.riskyHit = true
    if (before.total >= 18 && total === 21) hand.needle = true
  }
  // A bust ends the hand; so does 21, which can only be stood on.
  if (total >= 21) endHand()
  else afterMove()
}

function stand() {
  if (state.done) return
  recordDecision('stand')
  endHand()
}

// Double the bet, take exactly one more card, and stand.
function double() {
  if (!canDoubleNow()) return
  const hand = activeHand()
  recordDecision('double')
  hand.doubled = true
  if (state.ranked) writeStorage(ROUND_KEY, String(stake()))
  drawTo(hand)
  el.result.textContent = ''
  endHand()
}

// Split a pair into two hands, each dealt a second card. Split aces get one
// card each and stand.
function split() {
  if (!canSplitNow()) return
  recordDecision('split')
  const [first, second] = activeHand().cards
  const fromAces = first.rank === 'A'
  state.hands = [newHand([first]), newHand([second])]
  for (const hand of state.hands) {
    hand.fromAces = fromAces
    drawTo(hand, { sound: false })
  }
  play('deal')
  play('deal', { at: 0.08 })
  if (state.ranked) writeStorage(ROUND_KEY, String(stake()))
  el.result.textContent = ''
  buildHandViews()
  if (fromAces) {
    for (const hand of state.hands) hand.done = true
    return dealerTurn()
  }
  settleAutomaticHands()
}

// Finish the active hand and move to the next one, or to the dealer.
function endHand() {
  activeHand().done = true
  if (state.active + 1 < state.hands.length) {
    state.active++
    settleAutomaticHands()
  } else {
    dealerTurn()
  }
}

// A hand sitting on 21 has no decision left, so it stands by itself.
function settleAutomaticHands() {
  if (handValue(activeHand().cards).total === 21) return endHand()
  afterMove()
}

function afterMove() {
  renderShoe()
  updateCounts()
  updateActions()
  ;(el.hit.hidden ? el.again : el.hit).focus()
}

// The dealer plays out in state now; the table shows it card by card after.
// If every hand has busted, the dealer has nothing to beat and doesn't draw.
function dealerTurn() {
  if (!state.hands.every(isBust)) {
    while (dealerShouldHit(state.dealer)) state.dealer.push(state.deck.pop())
  }
  finish()
}

const RESULT_TAGS = { player: 'Win', dealer: 'Loss', push: 'Push' }

function resultText(winners) {
  const dealer = handValue(state.dealer).total
  if (winners.length > 1) {
    const count = (w) => winners.filter((x) => x === w).length
    const parts = [
      count('player') && `${count('player')} win${count('player') > 1 ? 's' : ''}`,
      count('dealer') && `${count('dealer')} loss${count('dealer') > 1 ? 'es' : ''}`,
      count('push') && `${count('push')} push${count('push') > 1 ? 'es' : ''}`,
    ].filter(Boolean)
    return `Split: ${parts.join(', ')}`
  }
  const [winner] = winners
  const [hand] = state.hands
  const doubled = hand.doubled ? 'Double down: ' : ''
  if (winner === 'push') return `${doubled}Push — nobody wins`
  if (winner === 'player') {
    if (isBlackjack(hand.cards)) return 'Blackjack! You win'
    return `${doubled}${dealer > 21 ? 'Dealer busts — you win!' : 'You win!'}`
  }
  if (isBust(hand)) return `${doubled}Bust — dealer wins`
  return isBlackjack(state.dealer) ? 'Dealer has blackjack' : `${doubled}Dealer wins`
}

// Settle and save the hand straight away, then play the dealer's reveal.
function finish() {
  state.done = true
  updateActions()
  updateCounts()
  renderShoe()

  const split = state.hands.length > 1
  const winners = state.hands.map((hand) => outcome(hand.cards, state.dealer, { split }))
  const beforeRp = profile.rp
  beforePeak = profile.peakRp
  if (state.ranked) sessionHands++
  const result = scoreRound(profile, {
    hands: state.hands.map((hand, i) => ({
      cards: hand.cards,
      winner: winners[i],
      doubled: hand.doubled,
      riskyHit: hand.riskyHit,
      needle: hand.needle,
    })),
    dealer: state.dealer,
    stacked: !state.ranked,
    at: Date.now(),
    sessionHands,
    firstInShoe: state.firstInShoe,
    decisions: state.decisions,
    // The shoe has reached the cut card, so the next hand starts a new one.
    lastInShoe: state.ranked && needsShuffle(state.shoe),
  })
  if (!result.unranked) {
    profile = result.profile
    saveProfile()
    writeStorage(ROUND_KEY, null)
  }
  playDealerReveal().then(() => showResult(winners, result, beforeRp))
}

function showResult(winners, result, beforeRp) {
  el.result.textContent = resultText(winners)
  const won = winners.filter((w) => w === 'player').length
  const lost = winners.filter((w) => w === 'dealer').length
  const overall = won > lost ? 'player' : lost > won ? 'dealer' : 'push'
  const natural = state.hands.length === 1 && isBlackjack(state.hands[0].cards)
  const sting =
    overall === 'push' ? 'push'
    : overall === 'player' ? (natural ? 'blackjack' : 'win')
    : state.hands.every(isBust) ? 'bust' : 'lose'
  play(sting)
  if (sting === 'bust' || sting === 'blackjack' || sting === 'win') buzz(sting)
  state.hands.forEach((hand, i) => {
    if (winners[i] !== 'dealer') hand.view.counter.classList.add('winner')
    if (state.hands.length > 1) hand.view.tag.textContent = `${hand.doubled ? '2× · ' : ''}${RESULT_TAGS[winners[i]]}`
  })
  if (overall !== 'player') el.dealerCounter.classList.add('winner')
  renderRankChip(beforeRp)
  renderRoundScore(result, beforeRp)

  el.again.hidden = el.toSetup.hidden = false
  // Focus first: a celebration takes focus and hands it back when it closes.
  el.again.focus()
  // A promotion (or a new Legend star) plays first, then the hand's badges.
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  if (!result.unranked && step(result.profile.rp) > step(beforeRp)) {
    // A new best tier unlocks a table and card back.
    const newTier = result.after.tierIndex > rankOf(beforePeak).tierIndex
    celebrateRank(result.before, result.after, { note: newTier ? `Unlocked: ${unlocksAt(result.after.tierIndex)}` : '' })
  }
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
el.double.addEventListener('click', double)
el.split.addEventListener('click', split)
el.stand.addEventListener('click', () => stand())
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
  el.settingCoach.checked = prefs.coach
  renderCosmetics()
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
el.settingCoach.addEventListener('change', () => setSetting('coach', el.settingCoach.checked))
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
  applyTable()
  renderCosmetics()
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
  applyTable()
  renderCosmetics()
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
    if (key === 'd') double()
    if (key === 'p') split()
  } else if (key === 'r' || (key === 'enter' && !onControl)) {
    startRound()
  }
})

if (readStorage(ROUND_KEY)) {
  // The flag holds the bets at risk (a double or split raises it); anything odd counts as one.
  const saved = Number(readStorage(ROUND_KEY))
  const atStake = Number.isInteger(saved) && saved >= 1 && saved <= 4 ? saved : 1
  const result = scoreRound(profile, { winner: 'dealer', forfeit: true, stake: atStake })
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
applyTable()
for (const id of caughtUp.earned) celebrate(badgeById(id))
