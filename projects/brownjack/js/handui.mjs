// handui.mjs — the after-hand grade chip and the notice toast, shared by the
// game and the dev page so both show exactly the same thing.
import { featureName, isHallOfFame, oneIn } from './handodds.mjs'

// The hand's grade as one letter among the round's other chips; tapping it
// shows why. A brutal hand (rare the painful way) says so. A rare hand (S or
// better) arrives locked, in a spotlight: the rest
// of the screen goes dark and taps elsewhere only nudge it, until it's tapped
// and `onReveal` runs.
export function gradeChip(record, { onReveal } = {}) {
  const chip = document.createElement('button')
  chip.type = 'button'
  chip.className = 'grade-pill'
  chip.dataset.grade = record.grade
  chip.classList.toggle('brutal', Boolean(record.brutal))
  const hall = record.brutal ? 'Hall of Shame' : 'Hall of Fame'
  const kind = record.brutal ? 'Brutal hand' : 'Rare hand'
  const why = `${record.brutal ? 'Brutal · ' : ''}${featureName(record.reason)} · ${oneIn(record.chance)} hands${record.place ? ` · #${record.place} in your ${hall}` : ''}`
  chip.append(
    Object.assign(document.createElement('span'), { className: 'grade-letter', textContent: record.grade }),
    Object.assign(document.createElement('span'), { className: 'grade-detail', textContent: why }),
    Object.assign(document.createElement('span'), { className: 'grade-hint', textContent: `${kind}! Tap to reveal` }),
    ...['a', 'b', 'c', 'd'].map((spot) => Object.assign(document.createElement('span'), { className: `grade-spark spark-${spot}`, ariaHidden: 'true' })),
  )
  let locked = isHallOfFame(record.grade)
  const expand = (open) => {
    chip.setAttribute('aria-expanded', String(open))
    chip.setAttribute('aria-label', locked ? `${kind}, grade ${record.grade}: tap to reveal` : `Rarity ${record.grade}${open ? `: ${why}` : ''}`)
  }
  chip.classList.toggle('locked', locked)
  expand(false)
  chip.addEventListener('click', () => {
    if (!locked) return expand(chip.getAttribute('aria-expanded') !== 'true')
    locked = false
    chip.classList.replace('locked', 'revealed')
    clearSpotlight()
    expand(true)
    onReveal?.()
  })
  // Once it's on the page: bring it into view, and catch taps everywhere else.
  if (locked) requestAnimationFrame(() => chip.isConnected && spotlight(chip))
  return chip
}

let catcher = null

function spotlight(chip) {
  clearSpotlight()
  chip.scrollIntoView({ block: 'center', behavior: 'smooth' })
  catcher = document.createElement('div')
  catcher.className = 'spotlight-catch'
  catcher.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    // A chip that's gone (the player left the table) lets go of the screen.
    if (chip.isConnected && chip.offsetParent) nudge(chip)
    else clearSpotlight()
  })
  document.body.append(catcher)
}

export function clearSpotlight() {
  catcher?.remove()
  catcher = null
}

// Nudge a locked chip when something tries to get past it.
export function nudge(chip) {
  chip.classList.remove('nudge')
  void chip.offsetWidth
  chip.classList.add('nudge')
  chip.focus()
}

let closeToast = () => {}

// A short notice at the bottom of the screen, with an optional action button.
// It closes itself after a while; returns a function that closes it sooner.
export function showToast(message, { action, onAction, ms = 10_000 } = {}) {
  closeToast()
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.setAttribute('role', 'status')
  toast.append(Object.assign(document.createElement('p'), { textContent: message }))
  const close = () => {
    clearTimeout(timer)
    if (!toast.isConnected) return
    toast.classList.add('leaving')
    setTimeout(() => toast.remove(), 250)
  }
  if (action) {
    const button = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-action', textContent: action })
    button.addEventListener('click', () => {
      close()
      onAction?.()
    })
    toast.append(button)
  }
  const dismiss = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-close', textContent: '×' })
  dismiss.setAttribute('aria-label', 'Dismiss')
  dismiss.addEventListener('click', close)
  toast.append(dismiss)
  document.body.append(toast)
  const timer = setTimeout(close, ms)
  closeToast = close
  return close
}

export const hideToast = () => closeToast()
