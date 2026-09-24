// game.js — wires the rules in blackjack.mjs to the page.
import {
  RANKS,
  SUITS,
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
  DIVISIONS,
  LEGEND_AT,
  LOSS_POINTS,
  POINTS_PER_DIVISION,
  SHOWCASE_SIZE,
  TIERS,
  WIN_POINTS,
  awardHallBadges,
  catchUpBadges,
  moveShowcase,
  newProfile,
  pinBadge,
  rankOf,
  scoreRound,
} from './ranked.mjs'
import {
  celebrate,
  celebrateRank,
  celebrateUnlock,
  emblemElement,
  fillEmblem,
  glyphElement,
  isCelebrating,
} from './celebrate.mjs'
import { MAX_SAVE_BYTES, exportSave, parseSave, saveFileName } from './save.mjs'
import { buzz, canVibrate, play } from './sound.mjs'
import { getSettings, setSetting } from './prefs.mjs'
import { bestMove, describeSpot } from './strategy.mjs'
import {
  CARD_BACKS,
  TABLES,
  TOTAL_POINTS,
  byRank,
  isUnlocked,
  collectionPoints,
  nextTable,
  progress,
  selected,
  unlockedIds,
  unlocksAt,
} from './cosmetics.mjs'
import { tableSVG } from './tableart.mjs'
import {
  DAILY_HANDS,
  cleanDay,
  dailyKey,
  dailyNumber,
  dailyShoe,
  dailyStreak,
  formatScore,
  roundScore,
  shareText,
  totalScore,
} from './daily.mjs'
import { daysLeft, rollSeason, seasonId, seasonName } from './seasons.mjs'
import { featureName, isHallOfFame, isNotable, oneIn, rateHand } from './handodds.mjs'
import { clearSpotlight, gradeChip, nudge, showToast } from './handui.mjs'
import { addToHall, rankHall } from './halloffame.mjs'
import { GAME_URL, canvasBlob, drawShareCard, headline } from './sharecard.mjs'

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
  playDaily: $('play-daily'),
  dailyLabel: $('daily-label'),
  dailyMeta: $('daily-meta'),
  dailyDone: $('daily-done'),
  dailyShare: $('daily-share'),
  shareDaily: $('share-daily'),
  shareStatus: $('share-status'),
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
  rankSeason: $('rank-season'),
  seasonMedals: $('season-medals'),
  collection: $('collection'),
  openAppearance: $('open-appearance'),
  shareHand: $('share-hand'),
  shareDialog: $('share-dialog'),
  closeShare: $('close-share'),
  shareImage: $('share-image'),
  shareNative: $('share-native'),
  shareCopy: $('share-copy'),
  shareDownload: $('share-download'),
  shareHandStatus: $('share-hand-status'),
  openHall: $('open-hall'),
  hallDialog: $('hall-dialog'),
  closeHall: $('close-hall'),
  hallList: $('hall-list'),
  settingsAppearance: $('settings-appearance'),
  appearanceDialog: $('appearance-dialog'),
  closeAppearance: $('close-appearance'),
  appearanceCollection: $('appearance-collection'),
  appearanceTabs: $('appearance-tabs'),
  appearanceSections: $('appearance-sections'),
  badgeTabs: $('badge-tabs'),
  openRoadmap: $('open-roadmap'),
  roadmapDialog: $('roadmap-dialog'),
  closeRoadmap: $('close-roadmap'),
  roadmapSummary: $('roadmap-summary'),
  ladder: $('ladder'),
  notice: $('notice'),
  openBadges: $('open-badges'),
  openStats: $('open-stats'),
  statsDialog: $('stats-dialog'),
  closeStats: $('close-stats'),
  badgeCount: $('badge-count'),
  rankChip: $('rank-chip'),
  cutCard: $('cut-card'),
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
  showcaseSlots: $('showcase-slots'),
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
  tableArt: $('table-art'),
  coach: $('coach'),
}

const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }
const RANK_NAMES = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' }
const DEAL_LABELS = ['You', 'Dealer', 'You', 'Dealer ↓']

const state = {
  stacked: [],
  deck: [],
  // The player's hands: one, or two after a split. Each is
  // { cards, doubled, done, fromAces, riskyHit, needle, hailMary, view }.
  hands: [],
  active: 0,
  dealer: [],
  done: true,
  // 'ranked' (the shoe, for RP), 'rigged' (a stacked practice deck) or 'daily'.
  mode: 'ranked',
  // Today's daily challenge: its date key and seeded shoe.
  dailyKey: null,
  dailyShoe: null,
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
  const back = currentBack()
  wrapper.dataset.back = back.id
  if (back.shimmer) wrapper.classList.add('shimmer')
  img.className = 'card-back'
  img.src = `./assets/cards/${back.file}`
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

  // Done closes the picker; on a phone it's the only way to (no Escape key).
  const done = pickerButton('picker-done', ['Done'], () => closePicker({ restoreFocus: true }))
  head.append(done)
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

// What the unlock conditions read.
const collectionContext = () => ({ profile })
const currentBack = () => selected(CARD_BACKS, getSettings().cardBack, collectionContext())

// Oak is the wooden table under the page; the others are drawn full screen,
// with the printed line in the gap between the dealer's cards and the player's.
function applyTable() {
  const { id } = selected(TABLES, getSettings().table, collectionContext())
  document.documentElement.dataset.table = id
  let printAt = 0.5
  if (!el.game.hidden) {
    const top = el.dealerCards.getBoundingClientRect().bottom
    const bottom = el.playerHands.getBoundingClientRect().top
    if (bottom > top) printAt = (top + bottom) / 2 / innerHeight
  }
  el.tableArt.innerHTML = tableSVG(id, innerWidth, innerHeight, { printAt })
}

let resizeTimer
addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(applyTable, 120)
})

// Celebrate tables and backs unlocked since last time. Rank unlocks are already
// named on the tier-up celebration, so only the others get their own.
function announceUnlocks() {
  const now = unlockedIds(collectionContext())
  const seen = getSettings().unlocksSeen
  setSetting('unlocksSeen', [...new Set([...(seen ?? []), ...now])])
  // The first run with this feature takes everything already unlocked as known.
  if (!seen) return
  for (const id of now.filter((unlockedId) => !seen.includes(unlockedId))) {
    const table = TABLES.find((t) => t.id === id)
    const item = table ?? CARD_BACKS.find((b) => b.id === id)
    if (byRank(item)) continue
    celebrateUnlock(item, table ? 'table' : 'back', progress(item, collectionContext()).text)
  }
}

// Appearance: tables and card backs on their own tabs, each in groups by how
// they're unlocked. The tab holds while the page is open.
let appearanceTab = 'table'

const badgeRarity = (item) => BADGES.find((b) => b.id === item.unlock[1]).rarity
const APPEARANCE = {
  table: {
    label: 'Tables',
    list: TABLES,
    groups: [
      ['Rank', (t) => byRank(t)],
      ['Collection', (t) => !byRank(t)],
    ],
  },
  cardBack: {
    label: 'Card backs',
    list: CARD_BACKS,
    groups: [
      ['Rank', (b) => byRank(b)],
      ['Epic badges', (b) => !byRank(b) && badgeRarity(b) === 'Epic'],
      ['Legendary badges', (b) => !byRank(b) && badgeRarity(b) === 'Legendary'],
    ],
  },
}

function renderCosmetics() {
  const context = collectionContext()
  const picker = (list, key, current) => {
    const container = document.createElement('div')
    container.className = `swatches${key === 'cardBack' ? ' backs' : ''}`
    container.append(
      ...list.map((item) => {
        const state = progress(item, context)
        const unlocked = state.unlocked
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'swatch'
        button.disabled = !unlocked
        button.setAttribute('aria-pressed', String(item.id === current.id))
        const preview = document.createElement('span')
        preview.className = 'swatch-preview'
        if (key === 'table') {
          preview.dataset.table = item.id
          preview.innerHTML = tableSVG(item.id, 200, 80, { detail: false })
        } else {
          preview.style.backgroundImage = `url('./assets/cards/${item.file}')`
        }
        const label = document.createElement('span')
        label.className = 'swatch-name'
        label.textContent = unlocked ? item.name : `🔒 ${item.name}`
        button.title = unlocked ? item.name : `${item.name}: ${state.text}`
        button.append(preview, label)
        if (!unlocked) {
          const how = document.createElement('small')
          how.className = 'swatch-how'
          how.textContent = state.status ? `${state.text} · ${state.status}` : state.text
          button.append(how)
        }
        button.addEventListener('click', () => {
          setSetting(key, item.id)
          applyTable()
          renderCosmetics()
          el.appearanceSections.querySelector('[aria-pressed="true"]')?.focus()
        })
        return button
      }),
    )
    return container
  }
  const current = { table: selected(TABLES, getSettings().table, context), cardBack: currentBack() }
  const unlockedOf = (list) => `${list.filter((item) => isUnlocked(item, context)).length}/${list.length}`

  renderCollection(el.appearanceCollection)
  el.appearanceTabs.replaceChildren(
    ...Object.entries(APPEARANCE).map(([key, tab]) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'badge-tab'
      button.setAttribute('role', 'tab')
      button.setAttribute('aria-selected', String(key === appearanceTab))
      button.append(tab.label, Object.assign(document.createElement('small'), { textContent: unlockedOf(tab.list) }))
      button.addEventListener('click', () => {
        appearanceTab = key
        renderCosmetics()
        el.appearanceTabs.querySelector('[aria-selected="true"]')?.focus()
      })
      return button
    }),
  )
  const tab = APPEARANCE[appearanceTab]
  el.appearanceSections.replaceChildren(
    ...tab.groups.map(([name, test]) => {
      const items = tab.list.filter(test)
      const section = document.createElement('section')
      section.className = 'badge-section'
      const heading = document.createElement('h3')
      heading.append(name, Object.assign(document.createElement('span'), { textContent: unlockedOf(items) }))
      const swatches = picker(items, appearanceTab, current[appearanceTab])
      swatches.setAttribute('aria-label', `${tab.label}: ${name}`)
      section.append(heading, swatches)
      return section
    }),
  )
}

function openAppearance() {
  renderCosmetics()
  el.appearanceDialog.showModal()
}

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0')

const renderEmblem = fillEmblem

function renderRank() {
  const rank = rankOf(profile.rp)
  renderEmblem(el.emblem, rank)
  el.rankName.textContent = rank.name
  el.rankBar.style.width = `${rank.progress}%`
  el.rankMeta.textContent = `${rank.progress} / ${POINTS_PER_DIVISION} RP${
    rank.tier === 'Legend' ? ' to next star' : ''
  } · ${profile.wins}W ${profile.losses}L ${profile.pushes}P`
  const days = daysLeft(profile.season)
  el.rankSeason.textContent = `Season ${profile.season} · ${days} day${days === 1 ? '' : 's'} left`
  el.badgeCount.textContent = `${Object.keys(profile.badges).length}/${BADGES.length}`
  renderShowcase(el.showcase)
}

// Move into the current season if a new one has started: soft-reset the rank,
// keep the old season as a medal, and say what happened.
function applySeason() {
  const rolled = rollSeason(profile, seasonId())
  if (rolled.profile === profile) return null
  profile = rolled.profile
  saveProfile()
  for (const id of rolled.earned) celebrate(badgeById(id))
  if (!rolled.ended) return null
  const { id, peakRp, finalRp } = rolled.ended
  return (
    `Season ${id} is over: you finished ${rankOf(finalRp).name} (peak ${rankOf(peakRp).name}). ` +
    `${seasonName(profile.season).split(' · ')[0]} starts you at ${rankOf(profile.rp).name}.`
  )
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
  if (state.mode === 'daily') {
    const rounds = dailyDay(state.dailyKey).rounds
    const hand = Math.min(rounds.length + (state.done ? 0 : 1), DAILY_HANDS)
    el.chipName.textContent = `Daily #${dailyNumber(state.dailyKey)}`
    el.chipRp.textContent = `Hand ${hand} of ${DAILY_HANDS}`
    el.chipNext.textContent = `Score ${formatScore(totalScore(rounds))} · same deal for everyone today`
    return
  }
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
  if (result.daily) {
    const { round, rounds } = result.daily
    el.roundScore.replaceChildren(
      ...[`Hand ${rounds.length} of ${DAILY_HANDS} ${formatScore(round.score)}`, `Total ${formatScore(totalScore(rounds))}`].map((text, i) => {
        const span = document.createElement(i ? 'strong' : 'span')
        span.className = i ? 'score-total' : 'score-line'
        span.textContent = text
        return span
      }),
    )
    el.roundScore.hidden = false
    return
  }
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

// ---- Stats board -----------------------------------------------------------------
// Pictures rather than a table of numbers: rank plates, a win-rate ring over the
// record, a strategy gauge and a few icon tiles.

const make = (tag, className, text) => {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

// A ring filled to `share` (0–1), with the big number in the middle.
function ring(share, label, sub, { color = 'var(--bark)' } = {}) {
  const box = make('div', 'stat-ring')
  const r = 30
  const length = 2 * Math.PI * r
  box.innerHTML =
    `<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="${r}" fill="none" stroke="rgb(73 38 18 / 0.12)" stroke-width="8"/>` +
    // Nothing to show yet: leave the track empty (a round cap would draw a dot).
    (share > 0
      ? `<circle cx="36" cy="36" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" ` +
        `stroke-dasharray="${(length * share).toFixed(1)} ${length.toFixed(1)}" transform="rotate(-90 36 36)"/>`
      : '') +
    '</svg>'
  const centre = make('div', 'stat-ring-centre')
  centre.append(make('strong', '', label), make('small', '', sub))
  box.append(centre)
  return box
}

function renderStats() {
  const now = profile.rp
  const seasonBest = Math.max(profile.seasonPeakRp ?? 0, now)
  const plates = make('div', 'stat-card stat-ranks')
  for (const [label, rp] of [['Now', now], [`Season ${profile.season}`, seasonBest], ['Best ever', profile.peakRp]]) {
    const cell = make('button', 'stat-rank')
    cell.type = 'button'
    cell.title = 'Open the rank roadmap'
    cell.append(emblemElement(rankOf(rp)), make('strong', '', rankOf(rp).name), make('small', '', label))
    cell.addEventListener('click', () => {
      el.statsDialog.close()
      el.openRoadmap.click()
    })
    plates.append(cell)
  }

  const { wins, losses, pushes, games } = profile
  const decided = wins + losses
  const record = make('div', 'stat-card stat-record')
  record.append(ring(decided ? wins / decided : 0, decided ? `${Math.round((100 * wins) / decided)}%` : '—', 'win rate'))
  const detail = make('div', 'record-detail')
  const bar = make('div', 'record-bar')
  const total = Math.max(1, wins + losses + pushes)
  for (const [kind, count] of [['w', wins], ['p', pushes], ['l', losses]]) {
    const part = make('span', `record-${kind}`)
    part.style.flexGrow = count / total
    bar.append(part)
  }
  const legend = make('div', 'record-legend')
  for (const [kind, name, count] of [['w', 'Wins', wins], ['p', 'Pushes', pushes], ['l', 'Losses', losses]]) {
    const item = make('span', '')
    item.append(make('i', `record-${kind}`), `${count} ${name}`)
    legend.append(item)
  }
  detail.append(make('strong', 'record-title', `${games} hands played`), bar, legend)
  record.append(detail)

  const accuracy = profile.decisions ? profile.goodDecisions / profile.decisions : 0
  const strategy = make('div', 'stat-card stat-strategy')
  strategy.append(
    ring(accuracy, profile.decisions ? `${Math.round(accuracy * 100)}%` : '—', 'accuracy', { color: '#2e6b1f' }),
  )
  const strategyText = make('div', 'record-detail')
  strategyText.append(
    make('strong', 'record-title', 'Strategy'),
    make('small', '', `${profile.goodDecisions} of ${profile.decisions} moves matched basic strategy`),
    make('small', '', `Best textbook run: ${profile.bestTextbookStreak} hands`),
  )
  strategy.append(strategyText)

  const tiles = make('div', 'stat-tiles')
  for (const [icon, value, label] of [
    ['🔥', profile.bestStreak, 'best win streak'],
    ['BJ', profile.blackjacks, 'blackjacks'],
    ['▲', profile.streak, 'current streak'],
  ]) {
    const tile = make('div', 'stat-tile')
    tile.append(make('span', 'stat-icon', icon), make('strong', '', value), make('small', '', label))
    tiles.append(tile)
  }

  el.stats.replaceChildren(plates, record, strategy, tiles)
}

function renderStatsDialog() {
  renderStats()
  const medals = [...(profile.seasons ?? [])].reverse()
  el.seasonMedals.hidden = medals.length === 0
  el.seasonMedals.replaceChildren(
    ...(medals.length ? [Object.assign(document.createElement('h3'), { textContent: 'Season medals' })] : []),
    ...medals.map((season) => {
      const item = document.createElement('div')
      item.className = 'medal-row'
      const emblem = document.createElement('span')
      emblem.className = 'emblem mini'
      renderEmblem(emblem, rankOf(season.peakRp))
      const text = document.createElement('span')
      text.textContent = `${seasonName(season.id)}: peak ${rankOf(season.peakRp).name}, finished ${rankOf(season.finalRp).name}`
      item.append(emblem, text)
      return item
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

function renderBadgesDialog() {
  renderCollection(el.collection)
  renderShowcaseEditor()
  renderBadgeTabs()
  const earnedOnly = badgeTab === 'Earned'
  const sections = CATEGORIES.filter((category) => earnedOnly || badgeTab === 'All' || badgeTab === category).map((category) => {
      const badges = BADGES.filter((badge) => badge.category === category)
      const shown = earnedOnly ? badges.filter((b) => profile.badges[b.id]) : badges
      if (!shown.length) return null
      const section = document.createElement('section')
      section.className = 'badge-section'
      const heading = document.createElement('h3')
      const count = document.createElement('span')
      count.textContent = `${badges.filter((b) => profile.badges[b.id]).length}/${badges.length}`
      heading.append(category, count)
      const grid = document.createElement('ul')
      grid.className = 'badge-grid'
      grid.append(...shown.map(badgeItem))
      section.append(heading, grid)
      return section
    }).filter(Boolean)
  el.badgeSections.replaceChildren(
    ...(sections.length
      ? sections
      : [Object.assign(document.createElement('p'), { className: 'showcase-hint', textContent: 'No badges yet. Play a few hands to earn some.' })]),
  )
}

// ---- The showcase editor ---------------------------------------------------

// One slot per showcase place, in order. A pinned badge can be dragged to another
// slot, moved with the arrow keys, or taken out with × (or Delete).
function renderShowcaseEditor() {
  const showcase = profile.showcase ?? []
  el.showcaseHint.textContent = showcase.length
    ? `${showcase.length}/${SHOWCASE_SIZE} · drag to reorder`
    : `Pin up to ${SHOWCASE_SIZE} earned badges below to show beside your rank`
  el.showcaseSlots.replaceChildren(
    ...Array.from({ length: SHOWCASE_SIZE }, (_, i) => {
      const badge = badgeById(showcase[i])
      const slot = document.createElement('li')
      if (!badge) {
        slot.className = 'slot empty'
        slot.textContent = 'Empty'
        return slot
      }
      slot.className = `slot filled ${badge.rarity.toLowerCase()}`
      slot.dataset.slot = badge.id
      slot.tabIndex = 0
      slot.setAttribute(
        'aria-label',
        `${badge.name}, place ${i + 1} of ${showcase.length}. Arrow keys move it, Delete removes it.`,
      )
      const name = Object.assign(document.createElement('span'), { className: 'slot-name', textContent: badge.name })
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.className = 'slot-remove'
      remove.textContent = '×'
      remove.setAttribute('aria-label', `Remove ${badge.name} from your showcase`)
      remove.addEventListener('click', () => unpinFromShowcase(badge.id))
      slot.append(glyphElement(badge), name, remove)
      slot.addEventListener('keydown', (event) => {
        const moves = { ArrowLeft: i - 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowDown: i + 1, Home: 0, End: showcase.length - 1 }
        if (event.key in moves) {
          event.preventDefault()
          reorderShowcase(badge.id, moves[event.key])
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          unpinFromShowcase(badge.id)
        }
      })
      slot.addEventListener('pointerdown', (event) => startSlotDrag(event, slot, badge.id))
      return slot
    }),
  )
}

function reorderShowcase(id, to) {
  const next = moveShowcase(profile, id, to)
  if (next === profile) return
  profile = next
  saveProfile()
  renderRank()
  renderShowcaseEditor()
  el.showcaseSlots.querySelector(`[data-slot="${id}"]`)?.focus()
}

// Keep focus in the editor, on the badge that slid into the freed place (or the
// last one). With the showcase empty, fall back to the badge's Pin button.
function unpinFromShowcase(id) {
  const index = profile.showcase.indexOf(id)
  const result = pinBadge(profile, id)
  profile = result.profile
  saveProfile()
  renderRank()
  renderBadgesDialog()
  const slots = el.showcaseSlots.querySelectorAll('.slot.filled')
  ;(slots[Math.min(index, slots.length - 1)] ?? el.badgeSections.querySelector(`[data-pin="${id}"]`))?.focus()
}

// Drag with a mouse, pen or finger: the badge follows the pointer and drops into
// the slot whose centre is nearest. A press that barely moves isn't a drag.
function startSlotDrag(event, slot, id) {
  if (event.button !== 0 || event.target.closest('.slot-remove')) return
  const slots = [...el.showcaseSlots.querySelectorAll('.slot.filled')]
  const centres = slots.map((s) => {
    const rect = s.getBoundingClientRect()
    return rect.left + rect.width / 2
  })
  const startX = event.clientX
  const startY = event.clientY
  let dragging = false
  let target = slots.indexOf(slot)
  slot.setPointerCapture(event.pointerId)

  const move = (e) => {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!dragging && Math.hypot(dx, dy) < 5) return
    dragging = true
    slot.classList.add('dragging')
    slot.style.transform = `translate(${dx}px, ${dy}px)`
    target = centres.reduce((best, c, i) => (Math.abs(c - e.clientX) < Math.abs(centres[best] - e.clientX) ? i : best), 0)
    slots.forEach((s, i) => s.classList.toggle('drop-target', i === target && s !== slot))
  }
  const end = (e) => {
    slot.removeEventListener('pointermove', move)
    slot.removeEventListener('pointerup', end)
    slot.removeEventListener('pointercancel', end)
    if (!dragging) return
    slot.style.transform = ''
    slot.classList.remove('dragging')
    slots.forEach((s) => s.classList.remove('drop-target'))
    if (e.type === 'pointerup') reorderShowcase(id, target)
  }
  slot.addEventListener('pointermove', move)
  slot.addEventListener('pointerup', end)
  slot.addEventListener('pointercancel', end)
}

// ---- Collection points and badge tabs ----------------------------------------------

// Collection points so far, and a bar from the last table unlocked to the next.
function renderCollection(container) {
  const context = collectionContext()
  const points = collectionPoints(profile)
  const upcoming = nextTable(context)
  const milestones = TABLES.filter((t) => t.unlock[0] === 'points').map((t) => t.unlock[1])
  const from = Math.max(0, ...milestones.filter((m) => m <= points))
  const to = upcoming ? upcoming.unlock[1] : TOTAL_POINTS
  const share = to > from ? Math.min(1, (points - from) / (to - from)) : 1

  const head = document.createElement('div')
  head.className = 'collection-head'
  head.append(
    Object.assign(document.createElement('strong'), { textContent: `${points} collection points` }),
    Object.assign(document.createElement('span'), { textContent: `of ${TOTAL_POINTS}` }),
  )
  const bar = document.createElement('div')
  bar.className = 'rank-bar collection-bar'
  bar.append(Object.assign(document.createElement('span'), { style: `width: ${Math.round(share * 100)}%` }))
  const next = document.createElement('div')
  next.className = 'collection-next'
  if (upcoming) {
    const thumb = document.createElement('span')
    thumb.className = 'collection-thumb'
    thumb.innerHTML = tableSVG(upcoming.id, 44, 28, { detail: false })
    next.append(thumb, `${to - points} more for the ${upcoming.name} table`)
  } else {
    next.append('Every table is unlocked')
  }
  const key = Object.assign(document.createElement('small'), {
    textContent: 'Each badge adds points: Common 1 · Rare 3 · Epic 8 · Legendary 20',
  })
  container.replaceChildren(head, bar, next, key)
}

// Badge types as tabs, with an All view; the choice holds while the page is open.
let badgeTab = 'All'

function renderBadgeTabs() {
  const tabs = ['All', 'Earned', ...CATEGORIES]
  el.badgeTabs.replaceChildren(
    ...tabs.map((tab) => {
      const badges = BADGES.filter((b) => tab === 'All' || tab === 'Earned' || b.category === tab)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'badge-tab'
      button.setAttribute('role', 'tab')
      button.setAttribute('aria-selected', String(tab === badgeTab))
      button.append(tab, Object.assign(document.createElement('small'), {
        textContent: `${badges.filter((b) => profile.badges[b.id]).length}/${badges.length}`,
      }))
      button.addEventListener('click', () => {
        badgeTab = tab
        renderBadgesDialog()
        el.badgeTabs.querySelector('[aria-selected="true"]')?.focus()
      })
      return button
    }),
  )
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
  announceUnlocks()
}

// ---- The round -------------------------------------------------------------

const activeHand = () => state.hands[state.active]
const newHand = (cards = []) => ({ cards, doubled: false, done: false, fromAces: false, riskyHit: false, needle: false, hailMary: false, view: null })
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

// Like a real table, the only thing shown about the shoe is the cut card coming
// out: the hand in progress is the last before a reshuffle.
function renderShoe() {
  el.cutCard.hidden = !(state.ranked && needsShuffle(state.shoe))
}

function startRound({ daily = false } = {}) {
  closePicker()
  const mode = daily ? 'daily' : state.stacked.length ? 'rigged' : 'ranked'
  const ranked = mode === 'ranked'
  // A rigged game deals its own stacked deck and leaves the shoe alone.
  // A season can turn over mid-visit; the next ranked hand starts it.
  const seasonNote = ranked ? applySeason() : null
  const newShoe = ranked && needsShuffle(state.shoe)
  if (newShoe) state.shoe = createShoe()
  if (daily) openDailyShoe()
  Object.assign(state, {
    deck: daily ? state.dailyShoe.cards : ranked ? state.shoe.cards : buildDeck(state.stacked),
    firstInShoe: newShoe,
    decisions: [],
    hands: [newHand()],
    active: 0,
    dealer: [],
    done: false,
    mode,
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
  el.again.hidden = el.toSetup.hidden = el.shareHand.hidden = true
  state.gradeLock = false
  el.again.classList.remove('waiting')
  clearSpotlight()

  const arriving = el.game.hidden
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
  if (seasonNote) el.result.textContent = `${seasonName(profile.season).split(' · ')[0]} has begun`
  for (let i = 0; i < 4; i++) play('deal', { at: newShoe ? 0.5 + i * 0.08 : i * 0.08 })
  renderShoe()
  updateCounts()
  updateActions()
  // Line the print up with the hands once the table is on screen.
  if (arriving) applyTable()
  saveDailyProgress()
  // Nothing is preselected: moves are a click or H / S / D / P, never Enter.
  el.game.focus({ preventScroll: true })

  if (isBlackjack(hand.cards) || isBlackjack(state.dealer)) finish()
}

// Check a choice against basic strategy, and have the coach say so if it's on.
function recordDecision(move) {
  disarmLeave()
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
    if (before.total === 20 && total === 21) hand.hailMary = true
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
  saveDailyProgress()
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
  saveDailyProgress()
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
  saveDailyProgress()
  renderShoe()
  updateCounts()
  updateActions()
  if (el.hit.hidden) el.again.focus()
  else el.game.focus({ preventScroll: true })
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
  if (state.mode === 'daily') {
    const result = recordDailyRound(winners)
    playDealerReveal().then(() => showResult(winners, result, beforeRp))
    return
  }
  if (state.ranked) sessionHands++
  const result = scoreRound(profile, {
    hands: state.hands.map((hand, i) => ({
      cards: hand.cards,
      winner: winners[i],
      doubled: hand.doubled,
      riskyHit: hand.riskyHit,
      needle: hand.needle,
      hailMary: hand.hailMary,
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
  // Before announceUnlocks marks this hand's unlocks as seen.
  const { record, hallEarned } = handRecord(winners, result, beforeRp)
  lastHand = record
  showGrade(record)
  el.shareHand.hidden = false

  // A finished daily has no next hand: show the shareable result instead.
  const dailyOver = result.daily && result.daily.rounds.length >= DAILY_HANDS
  el.again.textContent = ''
  el.again.append(result.daily ? 'Next hand ' : 'Play again ', Object.assign(document.createElement('kbd'), { textContent: 'Enter' }))
  el.again.hidden = dailyOver
  el.toSetup.hidden = false
  if (dailyOver) showDailyShare(el.game)
  // Focus first: a celebration takes focus and hands it back when it closes.
  // A rare hand's grade has to be tapped before the next hand.
  ;(dailyOver ? el.shareDaily : state.gradeLock ? shownGrade : el.again).focus()
  if (result.daily) {
    for (const id of hallEarned) celebrate(badgeById(id))
    if (dailyOver || hallEarned.length) announceUnlocks()
    return
  }
  // A promotion (or a new Legend star) plays first, then the hand's badges.
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  if (!result.unranked && step(result.profile.rp) > step(beforeRp)) {
    // A new best tier unlocks a table and card back.
    const newTier = result.after.tierIndex > rankOf(beforePeak).tierIndex
    celebrateRank(result.before, result.after, { note: newTier ? `Unlocked: ${unlocksAt(result.after.tierIndex)}` : '' })
  }
  for (const id of [...result.earned, ...hallEarned]) celebrate(badgeById(id))
  announceUnlocks()
}

// ---- Sharing a hand and the Hall of Fame -----------------------------------------
// After every hand: how rare it was and its grade, and an image of it to share.
// Hands graded S or better go into this device's Hall of Fame, the ten rarest ever.

const HALL_KEY = 'brownjack.halloffame.v1'

function loadHall() {
  try {
    const saved = JSON.parse(readStorage(HALL_KEY))
    const valid = (e) => e && Number.isFinite(e.at) && Array.isArray(e.hands) && e.hands.length && Array.isArray(e.dealer)
    return Array.isArray(saved) ? rankHall(saved.filter(valid)) : []
  } catch {
    return []
  }
}

let hall = loadHall()
let lastHand = null
const saveHall = () => writeStorage(HALL_KEY, JSON.stringify(hall))
const plainCards = (cards) => cards.map(({ rank, suit }) => ({ rank, suit }))

// The finished hand as a record for the share image and the Hall of Fame (see
// sharecard.mjs), and any Hall of Fame badges it earned. Rigged hands aren't rated.
function handRecord(winners, result, beforeRp) {
  const rigged = result.unranked && !result.daily
  const hands = state.hands.map((hand, i) => ({
    cards: plainCards(hand.cards),
    winner: winners[i],
    doubled: hand.doubled,
    riskyHit: hand.riskyHit,
    needle: hand.needle,
    hailMary: hand.hailMary,
  }))
  const dealer = plainCards(state.dealer)
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  const record = {
    at: Date.now(),
    mode: result.daily ? 'daily' : rigged ? 'rigged' : 'ranked',
    label: result.daily
      ? `Daily #${dailyNumber(state.dailyKey)} · hand ${result.daily.rounds.length} of ${DAILY_HANDS}`
      : rigged ? 'Rigged · practice' : `Ranked · ${rankOf(profile.rp).name}`,
    hands,
    dealer,
    delta: result.unranked ? null : result.delta,
    rankUp: !result.unranked && step(result.profile.rp) > step(beforeRp) ? { from: result.before.name, to: result.after.name } : null,
    earned: result.earned,
    unlocks: [],
    place: null,
  }
  if (rigged) return { record: { ...record, chance: null, grade: null, reason: null }, hallEarned: [] }
  Object.assign(record, rateHand(record))
  const added = addToHall(hall, record)
  if (added.place) {
    record.place = added.place
    hall = added.hall
  }
  // The first hand in the Hall, and a full one, each earn a badge.
  const hallBadges = awardHallBadges(profile, hall.length, record.at)
  if (hallBadges.earned.length) {
    profile = hallBadges.profile
    saveProfile()
    renderRank()
  }
  record.earned = [...result.earned, ...hallBadges.earned]
  const seen = getSettings().unlocksSeen
  record.unlocks = seen ? unlockedIds(collectionContext()).filter((id) => !seen.includes(id)) : []
  if (added.place) {
    hall = hall.map((entry) => (entry.at === record.at ? { ...entry, earned: record.earned, unlocks: record.unlocks, place: record.place } : entry))
    saveHall()
  }
  return { record, hallEarned: hallBadges.earned }
}

// The grade chip among the round's chips, for hands graded A or better. A rare
// hand's has to be tapped before the next hand, and the first one ever points
// the way to the Hall of Fame.
let shownGrade = null

function showGrade(record) {
  shownGrade = isNotable(record.grade) ? gradeChip(record, { onReveal: revealRareHand }) : null
  state.gradeLock = Boolean(record.grade && isHallOfFame(record.grade))
  el.again.classList.toggle('waiting', state.gradeLock)
  if (!shownGrade) return
  el.roundScore.prepend(shownGrade)
  el.roundScore.hidden = false
}

function revealRareHand() {
  state.gradeLock = false
  el.again.classList.remove('waiting')
  if (!el.again.hidden) el.again.focus()
  if (getSettings().hallNoticeSeen) return
  setSetting('hallNoticeSeen', true)
  showToast('Your first hand graded S or better! It’s kept in your Hall of Fame, on the start screen.', {
    action: 'Open Hall of Fame',
    onAction: openHall,
    ms: 14_000,
  })
}

const shareCaption = (record) =>
  record.grade
    ? `My ${record.grade} hand in BrownJack (${featureName(record.reason)}, ${oneIn(record.chance)} hands). Play at ${GAME_URL}`
    : `A hand from BrownJack. Play at ${GAME_URL}`

let shareFile = null
let shareUrl = null

// Draw the hand, then offer whatever this browser can do with the image.
async function openShare(record) {
  shareFile = null
  el.shareImage.removeAttribute('src')
  el.shareNative.hidden = el.shareCopy.hidden = true
  el.shareDownload.hidden = true
  el.shareHandStatus.textContent = 'Drawing your hand…'
  el.shareDialog.showModal()
  try {
    const tableId = selected(TABLES, getSettings().table, collectionContext()).id
    const blob = await canvasBlob(await drawShareCard(record, { tableId }))
    const name = `brownjack-${record.grade ?? 'practice'}-${new Date(record.at).toISOString().slice(0, 10)}.png`
    if (shareUrl) URL.revokeObjectURL(shareUrl)
    shareUrl = URL.createObjectURL(blob)
    el.shareImage.src = shareUrl
    el.shareImage.alt = `${headline(record)}${record.grade ? `, rarity ${record.grade}: ${featureName(record.reason)}, ${oneIn(record.chance)} hands` : ''}`
    el.shareDownload.href = shareUrl
    el.shareDownload.download = name
    el.shareDownload.hidden = false
    shareFile = { blob, file: new File([blob], name, { type: 'image/png' }), text: shareCaption(record) }
    el.shareNative.hidden = !navigator.canShare?.({ files: [shareFile.file] })
    el.shareCopy.hidden = !(navigator.clipboard?.write && window.ClipboardItem)
    el.shareHandStatus.textContent = ''
  } catch {
    el.shareHandStatus.textContent = "Couldn't draw this hand. Try again."
  }
}

el.shareHand.addEventListener('click', () => lastHand && openShare(lastHand))
el.shareNative.addEventListener('click', async () => {
  if (!shareFile) return
  try {
    await navigator.share({ files: [shareFile.file], text: shareFile.text })
  } catch (error) {
    if (error?.name !== 'AbortError') el.shareHandStatus.textContent = "Couldn't open sharing. Download the image instead."
  }
})
el.shareCopy.addEventListener('click', async () => {
  if (!shareFile) return
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': shareFile.blob })])
    el.shareHandStatus.textContent = 'Image copied'
  } catch {
    el.shareHandStatus.textContent = "Couldn't copy the image. Download it instead."
  }
})
el.closeShare.addEventListener('click', () => el.shareDialog.close())
el.shareDialog.addEventListener('click', (event) => {
  if (event.target === el.shareDialog) el.shareDialog.close()
})

// The Hall of Fame: the ten rarest hands ever, rarest first.

const SUIT_SIGNS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' }
function cardsLine(cards) {
  const line = document.createElement('span')
  line.className = 'hall-cards'
  for (const { rank, suit } of cards) {
    line.append(Object.assign(document.createElement('span'), {
      className: suit === 'hearts' || suit === 'diamonds' ? 'red' : '',
      textContent: `${rank}${SUIT_SIGNS[suit]}`,
    }))
  }
  return line
}

function hallItem(entry, place) {
  const item = document.createElement('li')
  item.className = 'hall-entry'
  const grade = Object.assign(document.createElement('span'), { className: 'grade-chip', textContent: entry.grade })
  grade.dataset.grade = entry.grade
  const body = document.createElement('div')
  body.className = 'hall-body'
  const top = document.createElement('div')
  top.className = 'hall-top'
  top.append(
    Object.assign(document.createElement('strong'), { textContent: `#${place} · ${featureName(entry.reason)}` }),
    Object.assign(document.createElement('small'), {
      textContent: `${oneIn(entry.chance)} hands · ${headline(entry)} · ${new Date(entry.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
    }),
  )
  const table = document.createElement('div')
  table.className = 'hall-table'
  entry.hands.forEach((hand, i) => {
    if (i) table.append(' | ')
    table.append(cardsLine(hand.cards))
  })
  table.append(' vs ', cardsLine(entry.dealer))
  body.append(top, table)
  const share = Object.assign(document.createElement('button'), { type: 'button', className: 'text-btn', textContent: 'Share' })
  share.addEventListener('click', () => openShare({ ...entry, place }))
  item.append(grade, body, share)
  return item
}

function renderHall() {
  el.hallList.replaceChildren(
    ...(hall.length
      ? hall.map((entry, i) => hallItem(entry, i + 1))
      : [Object.assign(document.createElement('li'), {
          className: 'hall-empty',
          textContent: 'No hands graded S or better yet. Standoff, Royal Couple or Straight 21 would get you in.',
        })]),
  )
}

function openHall() {
  renderHall()
  el.hallDialog.showModal()
}

el.openHall.addEventListener('click', openHall)
el.closeHall.addEventListener('click', () => el.hallDialog.close())
el.hallDialog.addEventListener('click', (event) => {
  if (event.target === el.hallDialog) el.hallDialog.close()
})

// ---- Daily challenge -------------------------------------------------------------
// One attempt a day, saved after every hand. Leaving mid-hand counts that hand
// as a loss, like ranked; the rest of the day's hands can still be played.

const DAILY_KEY = 'brownjack.daily.v1'
const DAILY_KEEP_DAYS = 60

function loadDailyHistory() {
  try {
    const saved = JSON.parse(readStorage(DAILY_KEY)) ?? {}
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

let dailyHistory = loadDailyHistory()

function saveDailyHistory() {
  const keys = Object.keys(dailyHistory).sort().slice(-DAILY_KEEP_DAYS)
  dailyHistory = Object.fromEntries(keys.map((key) => [key, dailyHistory[key]]))
  writeStorage(DAILY_KEY, JSON.stringify(dailyHistory))
}

const dailyDay = (key) => cleanDay(dailyHistory[key]) ?? { rounds: [], drawn: 0 }
const dailyComplete = (key) => dailyDay(key).rounds.length >= DAILY_HANDS

// Rebuild today's shoe and skip the cards already dealt, so a reload resumes.
function openDailyShoe() {
  const key = dailyKey()
  if (state.dailyKey !== key || !state.dailyShoe) {
    state.dailyKey = key
    state.dailyShoe = dailyShoe(key)
    state.dailyShoe.cards.splice(state.dailyShoe.cards.length - dailyDay(key).drawn)
  }
}

// Mid-hand, remember what's at stake and how far into the shoe the deal is.
function saveDailyProgress() {
  if (state.mode !== 'daily' || state.done) return
  const day = dailyDay(state.dailyKey)
  dailyHistory[state.dailyKey] = {
    ...day,
    drawn: state.dailyShoe.size - state.dailyShoe.cards.length,
    inHand: stake(),
  }
  saveDailyHistory()
}

function recordDailyRound(winners) {
  const split = state.hands.length > 1
  const hands = state.hands.map((hand, i) => ({
    winner: winners[i],
    doubled: hand.doubled,
    natural: !split && isBlackjack(hand.cards),
  }))
  const round = { hands, score: roundScore(hands) }
  const day = dailyDay(state.dailyKey)
  const rounds = [...day.rounds, round]
  dailyHistory[state.dailyKey] = { rounds, drawn: state.dailyShoe.size - state.dailyShoe.cards.length }
  saveDailyHistory()
  return { unranked: true, earned: [], daily: { round, rounds } }
}

function renderDailyButton() {
  const key = dailyKey()
  const { rounds } = dailyDay(key)
  const streak = dailyStreak(dailyHistory, key)
  el.dailyLabel.textContent = `Daily #${dailyNumber(key)}`
  el.dailyMeta.textContent =
    rounds.length >= DAILY_HANDS ? `Done · ${formatScore(totalScore(rounds))}`
    : rounds.length ? `Resume · hand ${rounds.length + 1} of ${DAILY_HANDS}`
    : `${DAILY_HANDS} hands · same deal for everyone`
  if (streak > 1) el.dailyMeta.textContent += ` · 🔥 ${streak} days`
}

// The result card, on the table after the last hand or on the start screen.
function showDailyShare(host) {
  const key = dailyKey()
  el.dailyShare.textContent = shareText(key, dailyDay(key).rounds)
  el.shareStatus.textContent = ''
  host.append(el.dailyDone)
  el.dailyDone.hidden = false
}

el.playDaily.addEventListener('click', () => {
  const key = dailyKey()
  if (dailyComplete(key)) {
    if (el.dailyDone.hidden || el.dailyDone.parentElement !== el.start.querySelector('.panel')) {
      showDailyShare(el.start.querySelector('.panel'))
    } else {
      el.dailyDone.hidden = true
    }
    return
  }
  startRound({ daily: true })
})

el.shareDaily.addEventListener('click', async () => {
  const text = el.dailyShare.textContent
  try {
    if (navigator.share && matchMedia('(hover: none)').matches) {
      await navigator.share({ text })
      return
    }
    await navigator.clipboard.writeText(text)
    el.shareStatus.textContent = 'Copied to clipboard'
  } catch (error) {
    // A cancelled share sheet isn't a failure.
    if (error?.name === 'AbortError') return
    el.shareStatus.textContent = "Couldn't copy: select the text above instead"
  }
})

function nextRound() {
  if (state.gradeLock) return nudge(shownGrade)
  if (state.mode === 'daily') {
    if (!dailyComplete(state.dailyKey)) startRound({ daily: true })
    return
  }
  startRound()
}

function showSetup({ keepNotice = false } = {}) {
  disarmLeave()
  clearSpotlight()
  if (!keepNotice) el.notice.hidden = true
  state.done = true
  el.dailyDone.hidden = true
  renderDailyButton()
  el.game.hidden = true
  el.start.hidden = false
  applyTable()
  renderRank()
  el.play.focus()
}

// ---- Input -----------------------------------------------------------------

el.play.addEventListener('click', startRound)
el.again.addEventListener('click', nextRound)
el.toSetup.addEventListener('click', () => showSetup())
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

// ---- Rank roadmap ----------------------------------------------------------------
// Every tier and division from Legend down, marking where the player is, their
// best this season and ever, and what each tier pays and unlocks.

function statRows(container, rows) {
  container.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement('div')
      const dt = Object.assign(document.createElement('dt'), { textContent: label })
      const dd = Object.assign(document.createElement('dd'), { textContent: value })
      row.append(dt, dd)
      return row
    }),
  )
}

function renderRoadmap() {
  const now = profile.rp
  const best = profile.peakRp
  const seasonBest = Math.max(profile.seasonPeakRp ?? 0, now)
  statRows(el.roadmapSummary, [
    ['Now', rankOf(now).name],
    [`Season ${profile.season} best`, rankOf(seasonBest).name],
    ['All-time best', rankOf(best).name],
  ])

  const tag = (text, kind) => Object.assign(document.createElement('span'), { className: `ladder-tag ${kind}`, textContent: text })
  const step = (rp) => Math.floor(rp / POINTS_PER_DIVISION)
  const tiers = [...TIERS, 'Legend']
  el.ladder.replaceChildren(
    ...tiers.map((tier, tierIndex) => tierIndex).reverse().map((tierIndex) => {
      const item = document.createElement('li')
      const reachedTier = rankOf(best).tierIndex >= tierIndex
      item.className = `ladder-tier${reachedTier ? ' reached' : ''}${rankOf(now).tierIndex === tierIndex ? ' current' : ''}`
      item.dataset.tier = tiers[tierIndex].toLowerCase()

      // The tier's header: plate, name, points, unlocks.
      const head = document.createElement('div')
      head.className = 'ladder-head'
      const start = tierIndex * DIVISIONS.length * POINTS_PER_DIVISION
      const plate = emblemElement(tierIndex === TIERS.length ? rankOf(LEGEND_AT) : rankOf(start))
      plate.classList.add('mini')
      const title = document.createElement('div')
      title.className = 'ladder-title'
      title.append(
        Object.assign(document.createElement('strong'), { textContent: tiers[tierIndex] }),
        Object.assign(document.createElement('small'), {
          textContent: `Win +${WIN_POINTS[tierIndex]} · Loss −${LOSS_POINTS[tierIndex]} · from ${start} RP`,
        }),
      )
      const unlocks = document.createElement('div')
      unlocks.className = 'ladder-unlocks'
      const table = TABLES.find((t) => byRank(t) && t.unlock[1] === tierIndex)
      const back = CARD_BACKS.find((b) => byRank(b) && b.unlock[1] === tierIndex)
      const tableThumb = document.createElement('span')
      tableThumb.className = 'ladder-thumb felt'
      tableThumb.innerHTML = tableSVG(table.id, 60, 40, { detail: false })
      tableThumb.title = `${table.name} table`
      const backThumb = document.createElement('span')
      backThumb.className = 'ladder-thumb back'
      backThumb.style.backgroundImage = `url('./assets/cards/${back.file}')`
      backThumb.title = `${back.name} card back`
      unlocks.append(tableThumb, backThumb)
      if (!reachedTier) unlocks.append(Object.assign(document.createElement('span'), { className: 'ladder-lock', textContent: '🔒' }))
      head.append(plate, title, unlocks)
      item.append(head)

      // Its steps: three divisions, or Legend's stars that matter (the next
      // one, best ever, season best, now, and ★0).
      const steps = document.createElement('ol')
      steps.className = 'ladder-steps'
      const stepList =
        tierIndex < TIERS.length
          ? DIVISIONS.map((_, i) => start + i * POINTS_PER_DIVISION).reverse()
          : [
              ...new Set([
                LEGEND_AT + Math.max(step(Math.max(best, now) - LEGEND_AT) + 1, 0) * POINTS_PER_DIVISION,
                LEGEND_AT + Math.max(step(best - LEGEND_AT), 0) * POINTS_PER_DIVISION,
                LEGEND_AT + Math.max(step(seasonBest - LEGEND_AT), 0) * POINTS_PER_DIVISION,
                LEGEND_AT + Math.max(step(now - LEGEND_AT), 0) * POINTS_PER_DIVISION,
                LEGEND_AT,
              ]),
            ].sort((a, b) => b - a)
      for (const from of stepList) {
        const rank = rankOf(from)
        const stepEl = document.createElement('li')
        const isNow = step(now) === step(from)
        const isBest = step(best) === step(from)
        stepEl.className = `ladder-step${best >= from ? ' done' : ''}${isNow ? ' now' : ''}`
        stepEl.append(Object.assign(document.createElement('span'), { className: 'ladder-name', textContent: rank.name }))
        if (isNow) {
          const bar = document.createElement('span')
          bar.className = 'rank-bar ladder-bar'
          bar.append(Object.assign(document.createElement('span'), { style: `width: ${rankOf(now).progress}%` }))
          stepEl.append(bar, tag('You are here', 'you'))
        }
        if (isBest && !isNow) stepEl.append(tag('Best', 'best'))
        if (step(seasonBest) === step(from) && !isNow && !isBest) stepEl.append(tag('Season best', 'season'))
        steps.append(stepEl)
      }
      item.append(steps)
      return item
    }),
  )
}

el.openRoadmap.addEventListener('click', () => {
  renderRoadmap()
  el.roadmapDialog.showModal()
  el.ladder.querySelector('.ladder-step.now')?.scrollIntoView({ block: 'center' })
})
el.closeRoadmap.addEventListener('click', () => el.roadmapDialog.close())
el.roadmapDialog.addEventListener('click', (event) => {
  if (event.target === el.roadmapDialog) el.roadmapDialog.close()
})

el.openStats.addEventListener('click', () => {
  renderStatsDialog()
  el.statsDialog.showModal()
})
el.closeStats.addEventListener('click', () => el.statsDialog.close())
el.statsDialog.addEventListener('click', (event) => {
  if (event.target === el.statsDialog) el.statsDialog.close()
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

el.openAppearance.addEventListener('click', openAppearance)
el.closeAppearance.addEventListener('click', () => el.appearanceDialog.close())
el.appearanceDialog.addEventListener('click', (event) => {
  if (event.target === el.appearanceDialog) el.appearanceDialog.close()
})
el.settingsAppearance.addEventListener('click', () => {
  el.settingsDialog.close()
  openAppearance()
})

el.openSettings.addEventListener('click', () => {
  const prefs = getSettings()
  el.settingSound.checked = prefs.sound
  el.settingHaptics.checked = prefs.haptics
  el.settingCoach.checked = prefs.coach
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
  // This device's Hall of Fame stays with the device, so its badges come along.
  const hallCaught = awardHallBadges(caughtUp.profile, hall.length)
  caughtUp.earned.push(...hallCaught.earned)
  profile = hallCaught.profile
  // An imported save from an earlier season rolls into this one.
  const importNote = applySeason()
  if (importNote) {
    el.notice.classList.add('info')
    el.notice.textContent = importNote
    el.notice.hidden = false
  }
  // A save from another device can't have a hand in progress here.
  writeStorage(ROUND_KEY, null)
  const stored = saveProfile()
  clearImport()
  renderRank()
  applyTable()
  renderCosmetics()
  announceUnlocks()
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
  applySeason()
  renderRank()
  applyTable()
  renderCosmetics()
  disarmReset()
  setStatus('Progress reset.')
})

// ---- Leaving mid-hand -------------------------------------------------------------
// A ranked or daily hand left unfinished counts as a loss of everything at stake,
// whether the page was closed or the player pressed Esc twice.

const validStake = (value) => (Number.isInteger(value) && value >= 1 && value <= 4 ? value : 1)

function forfeitRanked(atStake) {
  const result = scoreRound(profile, { winner: 'dealer', forfeit: true, stake: validStake(atStake) })
  profile = result.profile
  saveProfile()
  writeStorage(ROUND_KEY, null)
  return signed(result.delta)
}

function forfeitDaily(key, atStake) {
  const stakeNow = validStake(atStake)
  const day = dailyDay(key)
  if (day.rounds.length < DAILY_HANDS) {
    day.rounds.push({ hands: [{ winner: 'dealer', doubled: stakeNow > 1 }], score: -stakeNow, forfeit: true })
  }
  const drawn = key === state.dailyKey && state.dailyShoe ? state.dailyShoe.size - state.dailyShoe.cards.length : day.drawn
  dailyHistory[key] = { rounds: day.rounds, drawn }
  saveDailyHistory()
  return formatScore(-stakeNow)
}

function showWarning(text) {
  el.notice.classList.remove('info')
  el.notice.textContent = text
  el.notice.hidden = false
}

const LEAVE_WINDOW = 3000
let leaveArmed = null

// Esc: straight home when nothing is at stake; mid-hand, a second Esc confirms.
function requestLeave() {
  if (state.done || state.mode === 'rigged') return showSetup()
  if (!leaveArmed) {
    el.result.textContent = 'Press Esc again to leave: this hand counts as a loss'
    el.result.classList.add('warn')
    leaveArmed = setTimeout(disarmLeave, LEAVE_WINDOW)
    return
  }
  disarmLeave()
  state.done = true
  if (state.mode === 'daily') {
    showWarning(`You left your daily hand, so it counted as a loss (${forfeitDaily(state.dailyKey, stake())}).`)
  } else {
    showWarning(`You left mid-hand, so it counted as a loss (${forfeitRanked(stake())} RP).`)
  }
  showSetup({ keepNotice: true })
}

function disarmLeave() {
  clearTimeout(leaveArmed)
  leaveArmed = null
  if (el.result.classList.contains('warn')) {
    el.result.classList.remove('warn')
    el.result.textContent = ''
  }
}

// Enter and Space never play a move, even on a focused move button.
const MOVE_BUTTONS = new Set(['hit', 'stand', 'double', 'split'])
const blockMoveKeys = (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && MOVE_BUTTONS.has(event.target.id)) event.preventDefault()
}
window.addEventListener('keyup', blockMoveKeys)

window.addEventListener('keydown', (event) => {
  blockMoveKeys(event)
  if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
  if (document.querySelector('dialog[open]') || isCelebrating()) return
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
    return
  }
  if (key === 'escape') {
    event.preventDefault()
    return requestLeave()
  }
  if (!state.done) {
    if (key === 'h') hit()
    if (key === 's') stand()
    if (key === 'd') double()
    if (key === 'p') split()
  } else if (key === 'r' || (key === 'enter' && !onControl)) {
    nextRound()
  }
})

if (readStorage(ROUND_KEY)) {
  // The flag holds the bets at risk (a double or split raises it).
  const lost = forfeitRanked(Number(readStorage(ROUND_KEY)))
  showWarning(`Your last ranked hand was left unfinished and counted as a loss (${lost} RP).`)
}

const seasonNote = applySeason()
if (seasonNote) {
  // Keep an abandoned-hand notice alongside it (and its warning colour).
  el.notice.classList.toggle('info', el.notice.hidden)
  el.notice.textContent = el.notice.hidden ? seasonNote : `${el.notice.textContent} ${seasonNote}`
  el.notice.hidden = false
}

const caughtUp = catchUpBadges(profile)
// A Hall of Fame kept before its badges existed earns them now.
const hallCaught = awardHallBadges(caughtUp.profile, hall.length)
caughtUp.earned.push(...hallCaught.earned)
if (caughtUp.earned.length) {
  profile = hallCaught.profile
  saveProfile()
}

// A daily hand left unfinished counts as a loss of whatever was at stake.
const today = dailyHistory[dailyKey()]
if (today?.inHand) {
  const lost = forfeitDaily(dailyKey(), today.inHand)
  showWarning(`Your daily hand was left unfinished and counted as a loss (${lost}).`)
}

renderStack()
renderRank()
applyTable()
renderDailyButton()
// Play is where the start screen puts you; celebrations hand focus back to it.
el.play.focus()
for (const id of caughtUp.earned) celebrate(badgeById(id))
announceUnlocks()
