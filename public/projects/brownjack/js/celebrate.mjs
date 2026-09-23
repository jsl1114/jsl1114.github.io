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
const LOCK = { common: 800, rare: 1000, epic: 1300, legendary: 1800, division: 1800, tier: 2800, legend: 3000 }
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
export function emblemElement(rank) {
  const emblem = document.createElement('span')
  emblem.className = 'emblem'
  emblem.dataset.tier = rank.tier.toLowerCase()
  emblem.textContent = rank.division ?? `★${rank.stars}`
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
export function celebrateRank(from, to) {
  if (from.tier === to.tier) return enqueue(() => buildDivisionStep(from, to), LOCK.division, 'division', 'rankUp')
  return enqueue(() => buildTierFlip(from, to), to.tier === 'Legend' ? LOCK.legend : LOCK.tier, 'tier', 'rankUp')
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

function captions(card, kicker, name, desc) {
  card.append(
    node('p', 'celebration-kicker', kicker),
    node('h2', 'celebration-name', name),
    ...(desc ? [node('p', 'celebration-desc', desc)] : []),
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
function buildTierFlip(from, to) {
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
  captions(card, legend ? 'You are a Legend' : 'New tier', to.name, `${from.name} → ${to.name}`)
  overlay.append(screenFx, card)
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
