// halloffame.mjs — this device's best hands, week by week. Pure: no storage.
//
// Hands graded S or better are kept, each week's ten rarest; weeks run Monday
// to Sunday on the game's clock (US Eastern). An entry is a shared-hand record
// (see sharecard.mjs) with its `at`, `chance` and `grade`.
import { addDays, gameDate } from './gametime.mjs'
import { isHallOfFame } from './handodds.mjs'

export const HALL_SIZE = 10
// Weeks kept, so last week's (and a few before) can still be looked back on.
export const WEEKS_KEPT = 12

// The Monday a week starts on, as 'YYYY-MM-DD'.
export function weekOf(ms = Date.now()) {
  const day = gameDate(ms)
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  return addDays(day, -((weekday + 6) % 7))
}

// "Sep 21 – 27", "Sep 28 – Oct 4"
export function weekName(week) {
  const format = (key, withMonth) =>
    new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', day: 'numeric', ...(withMonth && { month: 'short' }) })
  const end = addDays(week, 6)
  return `${format(week, true)} – ${format(end, end.slice(5, 7) !== week.slice(5, 7))}`
}

const rarestFirst = (a, b) => a.chance - b.chance || a.at - b.at

// Add a hand if it qualifies and makes its week's top ten. Returns the new list
// (the same one if nothing changed) and the hand's place in its week, if any.
export function addToHall(hall, entry) {
  if (!entry.grade || !isHallOfFame(entry.grade)) return { hall, place: null }
  const week = weekOf(entry.at)
  const theWeek = [...hall.filter((e) => weekOf(e.at) === week), entry].sort(rarestFirst)
  const place = theWeek.indexOf(entry) + 1
  if (place > HALL_SIZE) return { hall, place: null }
  const weeks = [...new Set([...hall.map((e) => weekOf(e.at)), week])].sort().slice(-WEEKS_KEPT)
  const next = [...hall.filter((e) => weekOf(e.at) !== week && weeks.includes(weekOf(e.at))), ...theWeek.slice(0, HALL_SIZE)]
  return { hall: next, place }
}

export const hallWeek = (hall, week) => hall.filter((e) => weekOf(e.at) === week).sort(rarestFirst)

// Weeks with entries, newest first, always including the current one.
export const hallWeeks = (hall, now = Date.now()) =>
  [...new Set([weekOf(now), ...hall.map((e) => weekOf(e.at))])].sort().reverse()
