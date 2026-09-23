// celebrate.mjs — centered, full-screen celebrations for badge unlocks and
// rank-ups (see css/celebrate.css). Each badge rarity has its own animation; a
// promotion within a tier walks along that tier's divisions, and a promotion to
// a new tier flips a coin from the old emblem to the new one. Everything queues
// and plays one at a time. A celebration stays up until the player clicks or
// presses a key, which only counts once a short lock has passed, so it can't be
// dismissed by a click or key press that was meant for the game.
import { DIVISIONS } from './ranked.mjs'
import { buzz, play } from './sound.mjs'

// How long each celebration ignores clicks and keys, in ms: long enough to land
// the animation's main beat.
const LOCK = { common: 800, rare: 1000, epic: 1300, legendary: 1800, division: 1800, tier: 2800, legend: 3000, unlock: 1300 }
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn'])
const SPARKS = { common: 0, rare: 10, epic: 18, legendary: 28 }
const RINGS = { common: 1, rare: 2, epic: 3, legendary: 3 }
const FALLING_SUITS = ['♠', '♥', '♣', '♦']

const queue = []
let showing = false

export const isCelebrating = () => showing

// The round medal used everywhere a badge appears; long glyphs get a smaller size.
export function glyphElement(badge) {
  const glyph = document.createElement('span')
  glyph.className = badge.glyph.length > 3 ? 'badge-glyph long' : 'badge-glyph'
  glyph.textContent = badge.glyph
  return glyph
}

// The hexagon rank emblem (styled by .emblem[data-tier] in game.css).
// Legend plates draw each star up to this many (fewer on small plates, where
// more wouldn't be legible); beyond it they show a count.
export const MAX_DRAWN_STARS = 9
const MAX_DRAWN_STARS_SMALL = 3

// Fill a rank plate: the division numeral, or a Legend's stars (drawn one by
// one up to nine, in up to three rows; "★12" from ten on; a hollow star at zero).
export function fillEmblem(emblem, rank) {
  emblem.dataset.tier = rank.tier.toLowerCase()
  delete emblem.dataset.stars
  emblem.removeAttribute('aria-label')
  if (rank.division) {
    emblem.textContent = rank.division
    return
  }
  const { stars } = rank
  const limit = emblem.classList.contains('mini') ? MAX_DRAWN_STARS_SMALL : MAX_DRAWN_STARS
  if (stars === 0 || stars > limit) {
    emblem.textContent = stars ? `★${stars}` : '☆'
    return
  }
  const rows = stars <= 3 ? 1 : stars <= 6 ? 2 : 3
  const grid = document.createElement('span')
  grid.className = 'stars'
  grid.style.setProperty('--per-row', Math.ceil(stars / rows))
  grid.append(...Array.from({ length: stars }, () => Object.assign(document.createElement('span'), { textContent: '★' })))
  emblem.dataset.stars = stars
  emblem.replaceChildren(grid)
  emblem.setAttribute('aria-label', rank.name)
}

export function emblemElement(rank) {
  const emblem = document.createElement('span')
  emblem.className = 'emblem'
  fillEmblem(emblem, rank)
  return emblem
}

function enqueue(build, lock, sound, vibration) {
  return new Promise((resolve) => {
    queue.push({ build, lock, sound, vibration, resolve })
    if (!showing) showNext()
  })
}

export function celebrate(badge) {
  const rarity = badge.rarity.toLowerCase()
  return enqueue(() => build(badge), LOCK[rarity], rarity, 'badge')
}

// `from` and `to` are rankOf() results for a promotion or a new Legend star.
// `note` (optional) is an extra line, such as what the new tier unlocks.
export function celebrateRank(from, to, { note } = {}) {
  if (from.tier === to.tier) return enqueue(() => buildDivisionStep(from, to), LOCK.division, 'division', 'rankUp')
  return enqueue(() => buildTierFlip(from, to, note), to.tier === 'Legend' ? LOCK.legend : LOCK.tier, 'tier', 'rankUp')
}

function node(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function overlayElement(className, label) {
  const overlay = node('div', `celebration ${className}`)
  overlay.tabIndex = -1
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', label)
  return overlay
}

function sparks(container, total, reach) {
  for (let i = 0; i < total; i++) {
    const spark = node('span', 'spark')
    spark.style.setProperty('--angle', `${(360 / total) * i + Math.random() * 12}deg`)
    spark.style.setProperty('--distance', `${110 + Math.random() * reach}px`)
    spark.style.setProperty('--size', `${4 + Math.random() * 6}px`)
    spark.style.setProperty('--delay', `var(--burst-at, 0.3s)`)
    container.append(spark)
  }
}

function rings(container, total) {
  for (let i = 0; i < total; i++) {
    const ring = node('div', 'ring')
    ring.style.setProperty('--delay', `calc(var(--burst-at, 0.25s) + ${i * 0.35}s)`)
    container.append(ring)
  }
}

function captions(card, kicker, name, desc, note) {
  card.append(
    node('p', 'celebration-kicker', kicker),
    node('h2', 'celebration-name', name),
    ...(desc ? [node('p', 'celebration-desc', desc)] : []),
    ...(note ? [node('p', 'celebration-desc celebration-note', note)] : []),
    node('p', 'celebration-hint', 'Click anywhere or press any key to continue'),
  )
}

// Same tier: the tier's divisions in a row (or two Legend stars), lighting the next.
function buildDivisionStep(from, to) {
  const overlay = overlayElement(`rank-up division tier-${to.tier.toLowerCase()}`, `Promoted to ${to.name}`)
  const steps = to.tier === 'Legend' ? [from, to] : DIVISIONS.map((division) => ({ ...to, division }))
  const fromIndex = to.tier === 'Legend' ? 0 : DIVISIONS.indexOf(from.division)
  const toIndex = fromIndex + 1
  const row = node('div', 'division-row')
  steps.forEach((rank, i) => {
    // The link into each slot: already filled up to `from`, filling into `to`.
    if (i > 0) row.append(node('span', `division-link${i <= fromIndex ? ' filled' : i === toIndex ? ' filling' : ''}`))
    const state = i < fromIndex ? 'is-passed' : i === fromIndex ? 'is-from' : i === toIndex ? 'is-to' : 'is-ahead'
    const slot = node('div', `division-slot ${state}`)
    if (state === 'is-to') {
      rings(slot, 2)
      sparks(slot, 12, 60)
    }
    slot.append(emblemElement(rank))
    row.append(slot)
  })
  const card = node('div', 'celebration-card')
  card.append(row)
  captions(card, to.tier === 'Legend' ? 'New star' : 'Promoted', to.name, `${from.name} → ${to.name}`)
  overlay.append(node('div', 'celebration-fx'), card)
  return overlay
}

// New tier: toss a coin with the old emblem on the front and the new one on the back.
function buildTierFlip(from, to, note) {
  const legend = to.tier === 'Legend'
  const overlay = overlayElement(
    `rank-up tier tier-${to.tier.toLowerCase()}${legend ? ' to-legend' : ''}`,
    `New tier: ${to.name}`,
  )
  const screenFx = node('div', 'celebration-fx')
  if (legend) screenFx.append(node('div', 'flash'))

  const stage = node('div', 'medal coin-stage')
  stage.append(node('div', 'rays'))
  if (legend) stage.append(node('div', 'rays reverse'))
  rings(stage, 3)
  sparks(stage, legend ? 28 : 20, legend ? 170 : 120)
  const coin = node('div', 'coin')
  const front = node('div', 'coin-face coin-front')
  front.append(emblemElement(from))
  const back = node('div', 'coin-face coin-back')
  back.append(emblemElement(to))
  coin.append(front, back)
  stage.append(coin)

  const card = node('div', 'celebration-card')
  card.append(stage)
  captions(card, legend ? 'You are a Legend' : 'New tier', to.name, `${from.name} → ${to.name}`, note)
  overlay.append(screenFx, card)
  return overlay
}

// A new table or card back: `kind` is 'table' or 'back', `how` what unlocked it.
export function celebrateUnlock(item, kind, how) {
  return enqueue(() => buildUnlock(item, kind, how), LOCK.unlock, 'epic', 'badge')
}

// A card back: a face-down Classic card rises and turns over to show the new
// back. A table: a framed tabletop opens from the centre, then a sheen crosses it.
function buildUnlock(item, kind, how) {
  const label = kind === 'table' ? 'table' : 'card back'
  const overlay = overlayElement(`epic unlock unlock-for-${kind}`, `New ${label} unlocked: ${item.name}`)
  const stage = node('div', 'unlock-stage')
  stage.append(node('div', 'rays'))
  rings(stage, 2)
  sparks(stage, 18, 100)
  if (kind === 'table') {
    const top = node('div', 'unlock-table')
    const felt = node('span', 'unlock-felt')
    felt.dataset.table = item.id
    top.append(felt, node('span', 'unlock-sheen'))
    stage.append(top)
  } else {
    const card = node('div', 'unlock-card')
    // Faces are divs around the images, as on the rank coin: a bare <img> doesn't
    // reliably hide its back face mid-flip.
    const face = (file, className) => {
      const wrapper = node('div', className)
      wrapper.append(Object.assign(node('img'), { src: `./assets/cards/${file}`, alt: '' }))
      return wrapper
    }
    card.append(face('back.svg', 'unlock-face old'), face(item.file, `unlock-face new${item.shimmer ? ' shimmer' : ''}`))
    // The rise and fade live on a flat wrapper: animating opacity on the 3D card
    // itself would flatten it, and both faces would show.
    const rise = node('div', 'unlock-rise')
    rise.append(card)
    stage.append(rise)
  }
  const card = node('div', 'celebration-card')
  card.append(stage)
  captions(card, `New ${label} unlocked`, item.name, how, 'Choose it in Settings')
  overlay.append(node('div', 'celebration-fx'), card)
  return overlay
}

function build(badge) {
  const rarity = badge.rarity.toLowerCase()
  const overlay = overlayElement(rarity, `${badge.rarity} badge unlocked: ${badge.name}`)

  // Screen-wide effects: a flash and falling suits for Legendary.
  const screenFx = node('div', 'celebration-fx')
  if (rarity === 'legendary') {
    screenFx.append(node('div', 'flash'))
    for (let i = 0; i < 26; i++) {
      const suit = FALLING_SUITS[i % 4]
      const fall = node('span', 'suit-fall', suit)
      fall.style.setProperty('--x', `${Math.random() * 100}%`)
      fall.style.setProperty('--delay', `${0.3 + Math.random() * 2.2}s`)
      fall.style.setProperty('--duration', `${2.6 + Math.random() * 2}s`)
      fall.style.setProperty('--size', `${18 + Math.random() * 22}px`)
      fall.style.setProperty('--spin', `${(Math.random() - 0.5) * 720}deg`)
      fall.style.setProperty('--color', suit === '♥' || suit === '♦' ? '#ff6b6b' : '#ffe9a8')
      screenFx.append(fall)
    }
  }

  // Effects centered on the medal: rays, rings and a spark burst.
  const medal = node('div', 'medal')
  if (rarity === 'epic' || rarity === 'legendary') medal.append(node('div', 'rays'))
  if (rarity === 'legendary') medal.append(node('div', 'rays reverse'))
  for (let i = 0; i < RINGS[rarity]; i++) {
    const ring = node('div', 'ring')
    ring.style.setProperty('--delay', `${0.25 + i * 0.35}s`)
    medal.append(ring)
  }
  for (let i = 0; i < SPARKS[rarity]; i++) {
    const spark = node('span', 'spark')
    spark.style.setProperty('--angle', `${(360 / SPARKS[rarity]) * i + Math.random() * 12}deg`)
    spark.style.setProperty('--distance', `${110 + Math.random() * (rarity === 'legendary' ? 150 : 90)}px`)
    spark.style.setProperty('--size', `${4 + Math.random() * 6}px`)
    spark.style.setProperty('--delay', `${0.3 + Math.random() * 0.25}s`)
    medal.append(spark)
  }
  medal.append(glyphElement(badge))

  const card = node('div', 'celebration-card')
  card.append(
    medal,
    node('p', 'celebration-kicker', `${badge.rarity} badge unlocked`),
    node('h2', 'celebration-name', badge.name),
    node('p', 'celebration-desc', badge.desc),
    node('p', 'celebration-hint', 'Click anywhere or press any key to continue'),
  )
  overlay.append(screenFx, card)
  return overlay
}

function showNext() {
  const item = queue.shift()
  if (!item) {
    showing = false
    return
  }
  showing = true
  const overlay = item.build()
  const previousFocus = document.activeElement
  // An open modal <dialog> sits in the top layer, so celebrate inside it.
  ;(document.querySelector('dialog[open]') ?? document.body).append(overlay)
  overlay.focus()
  play(item.sound)
  buzz(item.vibration)

  // An open <dialog> would close on Escape underneath the celebration.
  const dialog = document.querySelector('dialog[open]')
  const holdDialog = (event) => event.preventDefault()
  dialog?.addEventListener('cancel', holdDialog)

  let unlocked = false
  let closed = false
  setTimeout(() => {
    unlocked = true
    overlay.classList.add('unlocked')
  }, item.lock)

  const close = () => {
    if (closed || !unlocked) return
    closed = true
    window.removeEventListener('keydown', onKey, true)
    dialog?.removeEventListener('cancel', holdDialog)
    overlay.classList.add('leaving')
    setTimeout(() => {
      overlay.remove()
      previousFocus?.focus?.()
      item.resolve()
      showNext()
    }, 300)
  }
  // Captured on window so no key reaches the page while a celebration is up,
  // even if focus has wandered off the overlay.
  const onKey = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.repeat || MODIFIER_KEYS.has(event.key)) return
    close()
  }
  window.addEventListener('keydown', onKey, true)
  overlay.addEventListener('click', close)
}
