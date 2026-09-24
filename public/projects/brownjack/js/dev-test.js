// dev-test.js — replays everything the game can celebrate or sound (dev only).
// Four tabs, each a set of grouped lists: rank-ups, badges, unlocks and sound.
import { BADGES, CATEGORIES, LEGEND_AT, POINTS_PER_DIVISION, rankOf } from './ranked.mjs'
import { badgeById } from './badges.mjs'
import { celebrate, celebrateRank, celebrateUnlock, emblemElement, glyphElement } from './celebrate.mjs'
import { CARD_BACKS, TABLES, byRank, progress, unlocksAt } from './cosmetics.mjs'
import { newProfile } from './ranked.mjs'
import { tableSVG } from './tableart.mjs'
import { featureName, isNotable, oneIn, rateHand } from './handodds.mjs'
import { addToHall } from './halloffame.mjs'
import { canvasBlob, drawShareCard } from './sharecard.mjs'
import { gradeChip, nudge, showToast } from './handui.mjs'
import { CARD_SOUND, audioContext, cardSound, play } from './sound.mjs'

const $ = (id) => document.getElementById(id)
const node = (tag, className, text) => {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

// ---- Settings-style building blocks -------------------------------------------

function group(tab, label, rows, note) {
  const heading = label ? [node('h2', 'group-label', label)] : []
  const list = node('div', 'group')
  list.append(...rows)
  $(`tab-${tab}`).append(...heading, list, ...(note ? [node('p', 'group-note', note)] : []))
}

function row(icon, label, { sub, detail, onClick }) {
  const button = node('button', 'row')
  button.type = 'button'
  const iconBox = node('span', 'row-icon')
  iconBox.append(icon)
  const text = node('span', 'row-label', label)
  if (sub) text.append(node('small', '', sub))
  button.append(iconBox, text)
  if (detail) button.append(node('span', 'row-detail', detail))
  button.append(node('span', 'row-chevron', '›'))
  button.addEventListener('click', onClick)
  return button
}

const symbol = (text) => node('span', 'symbol', text)

// ---- Rank-ups -------------------------------------------------------------------

const promotions = []
for (let rp = 50; rp < LEGEND_AT; rp += POINTS_PER_DIVISION) {
  promotions.push([rankOf(rp), rankOf(rp + POINTS_PER_DIVISION)])
}
const rankRow = ([from, to]) => {
  const newTier = from.tier !== to.tier
  const note = newTier ? `Unlocked: ${unlocksAt(to.tierIndex)}` : ''
  return row(emblemElement(to), `${from.name} → ${to.name}`, {
    sub: newTier ? note.replace('Unlocked: ', '') : undefined,
    onClick: () => celebrateRank(from, to, { note }),
  })
}
group('rank', 'New tier · coin flip', promotions.filter(([f, t]) => f.tier !== t.tier).map(rankRow),
  'Shown the first time a tier is reached, with what it unlocks.')
group('rank', 'Within a tier · division step', promotions.filter(([f, t]) => f.tier === t.tier).map(rankRow))
group('rank', 'Legend stars', [1, 4, 9, 12].map((stars) =>
  rankRow([rankOf(LEGEND_AT + (stars - 1) * 100 + 50), rankOf(LEGEND_AT + stars * 100 + 50)])),
'Plates draw each star up to nine, then switch to a count.')
group('rank', 'Queue', [
  row(symbol('⚡'), 'A lucky hand', {
    sub: 'A promotion, then four badges in turn',
    onClick: () => {
      celebrateRank(rankOf(850), rankOf(905), { note: `Unlocked: ${unlocksAt(3)}` })
      for (const id of ['hat-trick', 'heater', 'original', 'inferno']) celebrate(BADGES.find((b) => b.id === id))
    },
  }),
  // What importing a strong save queues: badges caught up, then every unlock.
  row(symbol('⇪'), 'An imported save', {
    sub: 'Twelve badges and ten unlocks: skip the rest for a summary',
    onClick: () => {
      const ids = ['natural', 'heater', 'straight', 'sevens', 'twins', 'flush', 'standoff', 'four-kind', 'regular', 'gold', 'meltdown', 'charlie']
      for (const id of ids) celebrate(BADGES.find((b) => b.id === id))
      for (const table of TABLES.slice(7, 12)) celebrateUnlock(table, 'table', progress(table, empty).text)
      for (const back of CARD_BACKS.filter((b) => !byRank(b)).slice(0, 5)) celebrateUnlock(back, 'back', progress(back, empty).text)
    },
  }),
])

// ---- Badges ---------------------------------------------------------------------

// The newest badges, up top while they're being tuned; each also appears under
// its type below.
const NEW_BADGES = ['doubled-out', 'overloaded', 'double-whammy', 'slow-burn', 'timber', 'aces-low', 'long-con', 'double-disaster',
  'hall-of-famer', 'hall-of-legends', 'four-kind', 'full-house', 'hail-mary', 'double-trouble', 'back-to-back', 'new-year']
group('badges', 'New', NEW_BADGES.map(badgeById).map((badge) =>
  row(glyphElement(badge), badge.name, { sub: badge.desc, detail: badge.rarity, onClick: () => celebrate(badge) })))
group('badges', 'By rarity', ['Common', 'Rare', 'Epic', 'Legendary'].map((rarity) => {
  const badge = BADGES.find((b) => b.rarity === rarity)
  const count = BADGES.filter((b) => b.rarity === rarity).length
  return row(glyphElement(badge), rarity, { detail: `${count} badges`, onClick: () => celebrate(badge) })
}))
for (const category of CATEGORIES) {
  group('badges', category, BADGES.filter((b) => b.category === category).map((badge) =>
    row(glyphElement(badge), badge.name, { sub: badge.desc, detail: badge.rarity, onClick: () => celebrate(badge) })))
}

// ---- Sharing a hand ---------------------------------------------------------------

// Sample hands for the share image and the Hall of Fame, rated as the game rates them.
const c = (rank, suit = 'hearts') => ({ rank, suit })
const hand = (winner, ...cards) => ({ cards, winner })
function sampleHand(hands, dealer, extra = {}) {
  const record = { at: Date.now(), mode: 'ranked', label: 'Ranked · Gold II', hands, dealer, delta: 25, rankUp: null,
    earned: [], unlocks: [], place: null, ...extra }
  return extra.mode === 'rigged' ? { ...record, chance: null, grade: null, reason: null } : { ...record, ...rateHand(record) }
}
const SAMPLE_HANDS = [
  ['Aces High, with a promotion', sampleHand([hand('player', c('A'), c('K', 'clubs')), hand('player', c('A', 'spades'), c('Q'))],
    [c('10', 'diamonds'), c('8', 'clubs')], { delta: 60, earned: ['aces-high', 'split-decision'], unlocks: ['aces'], rankUp: { from: 'Gold II', to: 'Gold III' }, place: 1 })],
  ['Straight 21', sampleHand([hand('player', c('6'), c('7', 'clubs'), c('8', 'spades'))], [c('10', 'diamonds'), c('9', 'clubs')], { earned: ['straight'] })],
  ['A split: one win, one loss', sampleHand([
    { cards: [c('8'), c('3', 'clubs'), c('K', 'spades')], winner: 'player', doubled: true },
    hand('dealer', c('8', 'spades'), c('10')),
  ], [c('9', 'diamonds'), c('10', 'clubs')], { delta: 30 })],
  ['A daily blackjack', sampleHand([hand('player', c('A'), c('Q'))], [c('9', 'spades'), c('8', 'clubs')],
    { mode: 'daily', label: 'Daily #2 · hand 3 of 5', delta: null })],
  ['Double Disaster, a brutal hand', sampleHand([
    { ...hand('dealer', c('8'), c('3', 'clubs'), c('5')), doubled: true },
    { ...hand('dealer', c('8', 'spades'), c('2'), c('7', 'clubs')), doubled: true },
  ], [c('6', 'diamonds'), c('10', 'clubs'), c('4')], { delta: -56, earned: ['double-disaster', 'double-whammy'], unlocks: ['disaster'], place: 1 })],
  ['A rigged hand', sampleHand([hand('player', c('A', 'spades'), c('J', 'clubs'))], [c('9', 'diamonds'), c('8', 'clubs')],
    { mode: 'rigged', label: 'Rigged · practice', delta: null })],
]
// Rare hands of every kind, for the Hall of Fame.
const HALL_SAMPLES = [
  [[hand('player', c('A'), c('K', 'clubs')), hand('player', c('A', 'spades'), c('Q'))], [c('10', 'diamonds'), c('8', 'clubs')]],
  [[hand('player', c('5'), c('5', 'clubs'), c('5', 'spades'), c('5', 'diamonds'))], [c('10'), c('7', 'clubs')]],
  [[hand('player', c('3'), c('3', 'clubs'), c('3', 'spades'), c('A'), c('A', 'clubs'), c('10'))], [c('9', 'spades'), c('9', 'clubs')]],
  [[hand('player', c('7'), c('7', 'clubs'), c('7', 'spades'))], [c('10', 'diamonds'), c('8', 'clubs')]],
  [[hand('player', c('2'), c('3', 'clubs'), c('2', 'spades'), c('4'), c('3'), c('5', 'clubs'))], [c('10'), c('6', 'clubs'), c('K')]],
  [[hand('push', c('A'), c('K'))], [c('A', 'clubs'), c('Q', 'clubs')]],
  [[hand('player', c('K'), c('Q'))], [c('2'), c('3'), c('4'), c('2', 'clubs'), c('5'), c('K', 'clubs')]],
  [[hand('player', c('A', 'spades'), c('J', 'clubs'))], [c('9', 'diamonds'), c('8', 'clubs')]],
  [[hand('player', c('K'), c('Q'))], [c('10', 'clubs'), c('9')]],
  [[hand('player', c('6'), c('7', 'clubs'), c('8', 'spades'))], [c('10', 'diamonds'), c('9', 'clubs')]],
  [[hand('player', c('A'), c('A', 'clubs'), c('A', 'spades'), c('8'))], [c('10', 'diamonds'), c('9', 'clubs')]],
  [[hand('player', c('K'), c('9'))], [c('10', 'clubs'), c('7')]],
  // And brutal ones, for the Hall of Shame.
  [[hand('dealer', c('A'), c('5')), hand('dealer', c('A', 'clubs'), c('6'))], [c('10', 'clubs'), c('9')]],
  [[hand('dealer', c('10'), c('8'))], [c('2'), c('3'), c('4', 'clubs'), c('2', 'spades'), c('5'), c('5', 'clubs')]],
  [[{ ...hand('dealer', c('8'), c('3', 'clubs'), c('5')), doubled: true }, { ...hand('dealer', c('8', 'spades'), c('2'), c('7', 'clubs')), doubled: true }],
    [c('6', 'diamonds'), c('10', 'clubs'), c('4')]],
  [[hand('dealer', c('2'), c('3', 'clubs'), c('2', 'spades'), c('4'), c('3', 'diamonds'), c('K'))], [c('10', 'diamonds'), c('7', 'clubs')]],
  [[hand('dealer', c('K'), c('9'))], [c('2', 'clubs'), c('4'), c('3'), c('5', 'spades'), c('7')]],
]
// The end of a hand, as the game shows it: the grade chip among the round's
// chips, and Play again waiting on a rare hand until its grade is tapped.
const AFTER_HAND = [
  ['A plain win', [hand('player', c('K'), c('9', 'clubs'))], [c('10', 'spades'), c('7')]],
  ['A blackjack', [hand('player', c('A', 'spades'), c('K'))], [c('10', 'clubs'), c('7')]],
  ['Photo Finish', [hand('player', c('10'), c('5', 'clubs'), c('6'))], [c('K', 'spades'), c('Q')]],
  ['Five-Card Charlie', [hand('player', c('2'), c('3', 'clubs'), c('4'), c('2', 'spades'), c('5'))], [c('10', 'clubs'), c('8')]],
  ['Straight 21', [hand('player', c('6'), c('7', 'clubs'), c('8', 'spades'))], [c('10', 'diamonds'), c('9', 'clubs')]],
  ['Hail Mary', [{ ...hand('player', c('10'), c('K', 'clubs'), c('A', 'spades')), riskyHit: true, needle: true, hailMary: true }], [c('10', 'clubs'), c('8')]],
  ['Aces High', [hand('player', c('A'), c('K', 'clubs')), hand('player', c('A', 'spades'), c('Q'))], [c('10', 'diamonds'), c('8', 'clubs')]],
  ['Brutal: Double Whammy', [hand('dealer', c('8'), c('10', 'clubs')), hand('dealer', c('8', 'spades'), c('9'))], [c('10', 'diamonds'), c('Q', 'clubs')]],
  ['Brutal: Timber!', [hand('dealer', c('2'), c('3', 'clubs'), c('2', 'spades'), c('4'), c('3', 'diamonds'), c('K'))], [c('10', 'diamonds'), c('7', 'clubs')]],
  ['Brutal: Double Disaster', [
    { ...hand('dealer', c('8'), c('3', 'clubs'), c('5')), doubled: true },
    { ...hand('dealer', c('8', 'spades'), c('2'), c('7', 'clubs')), doubled: true },
  ], [c('6', 'diamonds'), c('10', 'clubs'), c('4')]],
]
const stage = node('div', 'demo-stage')
const stageNote = node('p', 'group-note', 'Tap a row below to see the end of that hand here.')

function showAfterHand(record) {
  const again = node('button', 'action primary', 'Play again')
  again.type = 'button'
  const score = node('div', 'round-score')
  const chip = gradeChip(record, {
    onReveal: () => {
      again.classList.remove('waiting')
      stageNote.textContent = 'Revealed. Play again works now; tap the grade again to fold it.'
    },
  })
  const locked = chip.classList.contains('locked')
  again.classList.toggle('waiting', locked)
  again.addEventListener('click', () => {
    if (chip.classList.contains('locked')) return nudge(chip)
    stageNote.textContent = 'On to the next hand.'
  })
  const lost = record.hands.every((h) => h.winner === 'dealer')
  score.append(...(isNotable(record.grade) ? [chip] : []),
    node('span', 'score-line', lost ? 'Loss −14' : 'Win +30'), node('strong', 'score-total', lost ? '−14 RP' : '+30 RP'))
  stage.replaceChildren(again, score)
  stage.scrollIntoView({ block: 'center', behavior: 'smooth' })
  if (!isNotable(record.grade)) {
    stageNote.textContent = `Graded ${record.grade}: below A, so no grade is shown after the hand.`
    return
  }
  stageNote.textContent = locked
    ? `A ${record.brutal ? 'brutal' : 'rare'} hand: Play again waits (try it) until the grade is tapped.`
    : 'Tap the grade to see why it got it.'
}

group('share', 'After a hand', [
  ...AFTER_HAND.map(([name, hands, dealer]) => {
    const record = sampleHand(hands, dealer, { place: null })
    return row(symbol(record.grade), name, {
      sub: `${featureName(record.reason)} · ${oneIn(record.chance)} hands`,
      detail: record.grade,
      onClick: () => showAfterHand(record),
    })
  }),
  ...[['Hall of Fame', 'hand', 'rare'], ['Hall of Shame', 'brutal hand', 'brutal']].map(([hall, what, kind]) =>
    row(symbol(kind === 'brutal' ? '☠' : '!'), `First ${kind} hand notice`, {
      sub: `Shown once, when the first ${what} graded S or better is revealed`,
      onClick: () => showToast(`Your first ${what} graded S or better! It’s kept in your ${hall}, from the Hall of Fame button on the start screen.`, {
        action: `Open ${hall}`,
        onAction: () => { stageNote.textContent = `In the game, this opens the ${hall}.` },
        ms: 14_000,
      }),
    })),
])
// The demo sits above the rows it demonstrates.
const afterHandRows = $('tab-share').querySelector('.group:last-of-type')
afterHandRows.before(stage, stageNote)

async function openShareImage(record) {
  const canvas = await drawShareCard(record, { tableId: 'saloon' })
  open(URL.createObjectURL(await canvasBlob(canvas)), '_blank')
}
group('share', 'Share images', SAMPLE_HANDS.map(([name, record]) =>
  row(symbol(record.grade ?? '—'), name, {
    sub: record.grade ? `${record.grade} · ${featureName(record.reason)} · ${oneIn(record.chance)} hands` : 'Not graded',
    onClick: () => openShareImage(record),
  })), 'Opens the image in a new tab, drawn on the Saloon table.')
group('share', 'Hall of Fame', [
  row(symbol('★'), 'Fill the Hall of Fame', {
    sub: 'Sample hands, rare and brutal; the ones graded S or better make each hall',
    onClick: () => {
      let hall = []
      HALL_SAMPLES.forEach(([hands, dealer], i) => {
        hall = addToHall(hall, sampleHand(hands, dealer, { at: Date.now() - i * 86_400_000 })).hall
      })
      try {
        localStorage.setItem('brownjack.halloffame.v1', JSON.stringify(hall))
        hallStatus.textContent = `Saved ${hall.length} hands. Open the game's Hall of Fame to see them.`
      } catch {
        hallStatus.textContent = "This browser isn't letting the page store data."
      }
    },
  }),
  row(symbol('×'), 'Clear the Hall of Fame', {
    onClick: () => {
      try {
        localStorage.removeItem('brownjack.halloffame.v1')
      } catch {
        // Nothing stored.
      }
      hallStatus.textContent = 'Cleared.'
    },
  }),
])
const hallStatus = node('p', 'lab-status')
hallStatus.setAttribute('role', 'status')
$('tab-share').append(hallStatus)

// ---- Unlocks --------------------------------------------------------------------

const empty = { profile: newProfile() }
function thumb(item, kind) {
  const box = node('span', `thumb${kind === 'back' ? ' back' : ''}`)
  if (kind === 'table') box.innerHTML = tableSVG(item.id, 60, 60, { detail: false })
  else box.style.backgroundImage = `url('./assets/cards/${item.file}')`
  return box
}
const unlockRow = (item, kind) => {
  const how = progress(item, empty).text
  return row(thumb(item, kind), item.name, { sub: how, onClick: () => celebrateUnlock(item, kind, how) })
}
const tables = TABLES.filter((t) => t.id !== 'oak')
const backs = CARD_BACKS.filter((b) => b.id !== 'classic')
group('unlocks', 'Rank tables', tables.filter(byRank).map((t) => unlockRow(t, 'table')),
  'In the game these are named on the tier-up coin flip rather than shown on their own.')
group('unlocks', 'Collection tables', tables.filter((t) => !byRank(t)).map((t) => unlockRow(t, 'table')))
group('unlocks', 'Rank card backs', backs.filter(byRank).map((b) => unlockRow(b, 'back')))
const badgeBacks = (rarity) => backs.filter((b) => !byRank(b) && badgeById(b.unlock[1]).rarity === rarity)
group('unlocks', 'Legendary card backs', badgeBacks('Legendary').map((b) => unlockRow(b, 'back')), 'These shimmer on the table.')
group('unlocks', 'Epic card backs', badgeBacks('Epic').map((b) => unlockRow(b, 'back')))

// ---- Sound ----------------------------------------------------------------------

const SLIDERS = [
  ['clickMs', 'Click length (ms)', 2, 40, 1],
  ['clickHz', 'Click brightness (Hz)', 400, 8000, 100],
  ['clickDecay', 'Click crispness', 1, 20, 0.5],
  ['clickLevel', 'Click volume', 0, 1.5, 0.05],
  ['thudHz', 'Thud pitch (Hz)', 50, 400, 5],
  ['thudMs', 'Thud length (ms)', 10, 150, 5],
  ['thudLevel', 'Thud volume', 0, 1.5, 0.05],
  ['vary', 'Card-to-card variation', 0, 0.4, 0.01],
]
const PRESETS = {
  'Current default': { ...CARD_SOUND },
  'Crisp snap': { clickMs: 5, clickHz: 5200, clickDecay: 9, clickLevel: 1, thudHz: 180, thudMs: 25, thudLevel: 0.3, vary: 0.1 },
  'Old (burner)': { clickMs: 60, clickHz: 8000, clickDecay: 1, clickLevel: 0.9, thudHz: 150, thudMs: 10, thudLevel: 0, vary: 0 },
}
const lab = { ...CARD_SOUND }
const labBox = node('div', 'lab')
const status = node('p', 'lab-status')
status.setAttribute('role', 'status')

function renderLab() {
  labBox.replaceChildren(
    ...SLIDERS.flatMap(([key, label, min, max, step]) => {
      const name = Object.assign(node('label', '', label), { htmlFor: `lab-${key}` })
      const input = Object.assign(node('input'), { type: 'range', id: `lab-${key}`, min, max, step, value: lab[key] })
      const value = node('output', '', lab[key])
      input.addEventListener('input', () => {
        lab[key] = Number(input.value)
        value.textContent = input.value
      })
      input.addEventListener('change', () => playLab(1))
      return [name, input, value]
    }),
  )
}

function playLab(cards) {
  const ctx = audioContext()
  if (!ctx) {
    status.textContent = 'Sound is off: turn it on in the game’s Settings.'
    return
  }
  for (let i = 0; i < cards; i++) cardSound(ctx, i * 0.16, lab)
}

async function copyLab() {
  const text = `BrownJack card sound: ${JSON.stringify(lab)}`
  try {
    await navigator.clipboard.writeText(text)
    status.textContent = 'Copied. Paste it into the chat.'
  } catch {
    status.textContent = text
  }
}

group('sound', 'Card sound · presets', Object.entries(PRESETS).map(([name, preset]) =>
  row(symbol('♠'), name, {
    onClick: () => {
      Object.assign(lab, preset)
      renderLab()
      playLab(4)
    },
  })))
renderLab()
group('sound', 'Card sound · tune it', [labBox])
group('sound', '', [
  row(symbol('▶'), 'Play one card', { onClick: () => playLab(1) }),
  row(symbol('▶▶'), 'Play a deal', { sub: 'Four cards', onClick: () => playLab(4) }),
  row(symbol('⧉'), 'Copy settings', { sub: 'Paste them to Claude to make them the default', onClick: copyLab }),
])
$('tab-sound').append(status)

const SOUND_ROWS = [
  ['Table', [['deal', 'Card dealt'], ['flip', 'Hole card turned over'], ['shuffle', 'New shoe shuffled']]],
  ['Results', [['win', 'Win'], ['blackjack', 'Blackjack'], ['push', 'Push'], ['lose', 'Loss'], ['bust', 'Bust']]],
  ['Badges', [['common', 'Common'], ['rare', 'Rare'], ['epic', 'Epic · also table and card-back unlocks'], ['legendary', 'Legendary']]],
  ['Rank-ups', [['division', 'Division step'], ['tier', 'New tier']]],
]
for (const [label, sounds] of SOUND_ROWS) {
  group('sound', `Every sound · ${label}`, sounds.map(([id, name]) =>
    row(symbol('♪'), name, { detail: id, onClick: () => play(id) })))
}

// ---- Tab bar --------------------------------------------------------------------

const TITLES = { rank: 'Rank-ups', badges: 'Badges', unlocks: 'Unlocks', share: 'Share', sound: 'Sound' }
const TAB_KEY = 'brownjack.dev-tab'

function showTab(name) {
  for (const button of document.querySelectorAll('.tab')) button.setAttribute('aria-selected', String(button.dataset.tab === name))
  for (const panel of document.querySelectorAll('.dev-tab')) panel.hidden = panel.id !== `tab-${name}`
  $('dev-title').textContent = TITLES[name]
  try {
    sessionStorage.setItem(TAB_KEY, name)
  } catch {
    // Remembering the tab is a convenience.
  }
  scrollTo({ top: 0 })
}

for (const button of document.querySelectorAll('.tab')) button.addEventListener('click', () => showTab(button.dataset.tab))
let saved = null
try {
  saved = sessionStorage.getItem(TAB_KEY)
} catch {
  // Start on the first tab.
}
showTab(TITLES[saved] ? saved : 'rank')
