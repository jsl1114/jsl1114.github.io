// seasons.mjs — monthly ranked seasons with a soft reset. Pure: no DOM, no storage.
//
// A season is a calendar month on the game's clock (US Eastern); September 2026
// is Season 1. When a new one
// starts, everyone drops one tier from the start of their division, and the
// season that ended is kept as a medal: its peak and final rank.
import { DIVISIONS, POINTS_PER_DIVISION, rankOf } from './ranked.mjs'
import { awardBadges } from './badges.mjs'
import { gameClock, gameMidnight } from './gametime.mjs'

const FIRST_YEAR = 2026
const FIRST_MONTH = 8 // September, zero-based
export const SEASON_DROP = DIVISIONS.length * POINTS_PER_DIVISION

export function seasonId(now = Date.now()) {
  const { year, month } = gameClock(now)
  return (year - FIRST_YEAR) * 12 + (month - FIRST_MONTH) + 1
}

// The instant a season begins: midnight Eastern on the 1st.
const seasonStart = (id) => gameMidnight(FIRST_YEAR, FIRST_MONTH + id - 1, 1)

export const seasonName = (id) =>
  `Season ${id} · ${new Date(Date.UTC(FIRST_YEAR, FIRST_MONTH + id - 1, 15)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`

export const daysLeft = (id, now = Date.now()) => Math.max(0, Math.ceil((seasonStart(id + 1) - now) / 86_400_000))

// Where a new season starts you: one tier down from the start of your division.
export function softReset(rp) {
  const divisionStart = rp - (rp % POINTS_PER_DIVISION)
  return Math.max(0, divisionStart - SEASON_DROP)
}

// Bring a profile into season `id`. A profile that has never been in a season
// (new, or saved before seasons existed) simply joins the current one.
// Returns { profile, ended, earned }: `ended` is the medal for the season that
// just finished, if one did; `earned` any badges that unlocks.
export function rollSeason(profile, id, now = Date.now()) {
  // Seasons only move forward: a clock set back (or a save from a later season)
  // leaves the profile where it is rather than resetting it again.
  if (profile.season >= id) return { profile, ended: null, earned: [] }
  if (!profile.season) {
    return { profile: { ...profile, season: id, seasonPeakRp: profile.rp, seasonGames: 0 }, ended: null, earned: [] }
  }
  const played = profile.seasonGames > 0
  const ended = played ? { id: profile.season, peakRp: Math.max(profile.seasonPeakRp, profile.rp), finalRp: profile.rp } : null
  const rp = softReset(profile.rp)
  const next = {
    ...profile,
    rp,
    season: id,
    seasonPeakRp: rp,
    seasonGames: 0,
    seasons: ended ? [...(profile.seasons ?? []), ended] : profile.seasons ?? [],
    badges: { ...profile.badges },
  }
  const earned = ended
    ? awardBadges(next, [{ endedSeason: ended, endedRank: rankOf(ended.finalRp) }], now, ['season-legend', 'seasoned'])
    : []
  return { profile: next, ended, earned }
}
