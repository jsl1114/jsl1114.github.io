// halloffame.mjs — this device's Hall of Fame and Hall of Shame. Pure: no storage.
//
// Hands graded S or better qualify: brutal ones for the Hall of Shame, the rest
// for the Hall of Fame, each keeping its ten rarest of all time. Both live in one
// list of shared-hand records (see sharecard.mjs), rated again whenever it's
// read, so a change to the odds re-sorts (or re-files) hands already kept.
import { isHallOfFame, rarerThan, rateHand } from './handodds.mjs'
import { HALL_SIZE } from './ranked.mjs'

export { HALL_SIZE }

export const HALLS = ['fame', 'shame']
export const hallFor = (entry) => (entry.brutal ? 'shame' : 'fame')

// The kept entries, rated, rarest first within each hall; anything that no
// longer qualifies drops out.
export function rankHall(hall) {
  const rated = hall
    .map((entry) => ({ ...entry, ...rateHand(entry) }))
    .filter((entry) => isHallOfFame(entry.grade))
    .sort(rarerThan)
  return HALLS.flatMap((name) => rated.filter((entry) => hallFor(entry) === name).slice(0, HALL_SIZE))
}

// One hall's entries, rarest first.
export const hallOf = (hall, name) => hall.filter((entry) => hallFor(entry) === name)

// Add a rated hand if it qualifies and makes its hall's top ten. Returns the new
// list (the same one if nothing changed) and the hand's place in its hall, if any.
export function addToHall(hall, entry) {
  if (!entry.grade || !isHallOfFame(entry.grade)) return { hall, place: null }
  const ranked = rankHall([...hall, entry])
  const place = hallOf(ranked, hallFor(entry)).findIndex((e) => e.at === entry.at) + 1
  return place ? { hall: ranked, place } : { hall, place: null }
}
