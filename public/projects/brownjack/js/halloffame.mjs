// halloffame.mjs — this device's ten rarest hands of all time. Pure: no storage.
//
// Hands graded S or better qualify. An entry is a shared-hand record (see
// sharecard.mjs); it's rated again whenever the list is read, so a change to
// the odds re-sorts hands already kept.
import { isHallOfFame, rarerThan, rateHand } from './handodds.mjs'
import { HALL_SIZE } from './ranked.mjs'

export { HALL_SIZE }

// The kept entries, rated, rarest first; anything that no longer qualifies drops out.
export const rankHall = (hall) =>
  hall
    .map((entry) => ({ ...entry, ...rateHand(entry) }))
    .filter((entry) => isHallOfFame(entry.grade))
    .sort(rarerThan)
    .slice(0, HALL_SIZE)

// Add a rated hand if it qualifies and makes the top ten. Returns the new list
// (the same one if nothing changed) and the hand's place, if any.
export function addToHall(hall, entry) {
  if (!entry.grade || !isHallOfFame(entry.grade)) return { hall, place: null }
  const ranked = rankHall([...hall, entry])
  const place = ranked.findIndex((e) => e.at === entry.at) + 1
  return place ? { hall: ranked, place } : { hall, place: null }
}
