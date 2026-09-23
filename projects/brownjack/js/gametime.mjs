// gametime.mjs — the game's clock. Days and months (the daily challenge and
// ranked seasons) run on US Eastern time, daylight saving included, so they
// turn over at midnight in New York for everyone. Badges about the player's own
// night or calendar (Night Owl, Friday the 13th) use the player's local time.

export const GAME_TIME_ZONE = 'America/New_York'

const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: GAME_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

// The Eastern wall-clock time at `ms`: { year, month (0–11), day, hour, minute, second }.
export function gameClock(ms = Date.now()) {
  const out = {}
  for (const { type, value } of parts.formatToParts(new Date(ms))) out[type] = Number(value)
  return { year: out.year, month: out.month - 1, day: out.day, hour: out.hour, minute: out.minute, second: out.second }
}

const pad = (n) => String(n).padStart(2, '0')

// The game's calendar date at `ms`, as 'YYYY-MM-DD'.
export function gameDate(ms = Date.now()) {
  const { year, month, day } = gameClock(ms)
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

// How far Eastern time is behind UTC at `ms`, in ms (4 or 5 hours).
function offset(ms) {
  const c = gameClock(ms)
  return Date.UTC(c.year, c.month, c.day, c.hour, c.minute, c.second) - Math.floor(ms / 1000) * 1000
}

// The instant it becomes midnight Eastern on the given date (month 0–11; may overflow).
export function gameMidnight(year, month, day = 1) {
  const wall = Date.UTC(year, month, day)
  // Two passes settle the offset even on a daylight-saving changeover day.
  let ms = wall - offset(wall + 5 * 3_600_000)
  ms = wall - offset(ms)
  return ms
}

// Calendar arithmetic on 'YYYY-MM-DD' keys, independent of any time zone.
export const addDays = (key, days) =>
  new Date(Date.parse(`${key}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)

export const daysBetween = (from, to) =>
  Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000)
