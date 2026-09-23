// dev-test.js — buttons that replay every celebration: rank-ups and badges (dev only).
import { BADGES, CATEGORIES, LEGEND_AT, POINTS_PER_DIVISION, rankOf } from './ranked.mjs'
import { celebrate, celebrateRank, celebrateUnlock, emblemElement, glyphElement } from './celebrate.mjs'
import { CARD_BACKS, TABLES, byRank, progress } from './cosmetics.mjs'
import { newProfile } from './ranked.mjs'

function devButton(icon, label, onClick) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'dev-btn'
  button.append(icon, label)
  button.addEventListener('click', onClick)
  return button
}

const badgeButton = (badge, label) => {
  const button = devButton(glyphElement(badge), label, () => celebrate(badge))
  button.classList.add(badge.rarity.toLowerCase())
  return button
}

// Every promotion on the ladder, one division at a time, plus a Legend star.
const promotions = []
for (let rp = 50; rp < LEGEND_AT; rp += POINTS_PER_DIVISION) {
  promotions.push([rankOf(rp), rankOf(rp + POINTS_PER_DIVISION)])
}
promotions.push([rankOf(LEGEND_AT + 350), rankOf(LEGEND_AT + 450)])
const rankButton = ([from, to]) =>
  devButton(emblemElement(to), `${from.name} → ${to.name}`, () => celebrateRank(from, to))
document.getElementById('division-steps').append(
  ...promotions.filter(([from, to]) => from.tier === to.tier).map(rankButton),
)
document.getElementById('tier-flips').append(
  ...promotions.filter(([from, to]) => from.tier !== to.tier).map(rankButton),
)

// Achievement unlocks (rank ones are named on the tier-up celebration instead).
const empty = { profile: newProfile(), daily: { bestStreak: 0, completed: 0 } }
const unlockButton = (item, kind) => {
  const icon = document.createElement('span')
  icon.className = 'dev-swatch'
  if (kind === 'table') icon.dataset.table = item.id
  else icon.style.backgroundImage = `url('./assets/cards/${item.file}')`
  return devButton(icon, `${item.name} · ${kind}`, () => celebrateUnlock(item, kind, progress(item, empty).text))
}
document.getElementById('unlocks').append(
  ...TABLES.filter((t) => !byRank(t)).map((t) => unlockButton(t, 'table')),
  ...CARD_BACKS.filter((b) => !byRank(b)).map((b) => unlockButton(b, 'back')),
)

const rarities = ['Common', 'Rare', 'Epic', 'Legendary']
document.getElementById('by-rarity').append(
  ...rarities.map((rarity) => badgeButton(BADGES.find((b) => b.rarity === rarity), rarity)),
)
document.getElementById('by-badge').append(
  ...CATEGORIES.flatMap((category) => {
    const heading = document.createElement('h3')
    heading.textContent = category
    const row = document.createElement('div')
    row.className = 'dev-row'
    row.append(
      ...BADGES.filter((b) => b.category === category).map((badge) =>
        badgeButton(badge, `${badge.name} · ${badge.rarity}`),
      ),
    )
    return [heading, row]
  }),
)
// What a lucky hand looks like: a promotion, then several badges, in turn.
document.getElementById('play-all').addEventListener('click', () => {
  celebrateRank(rankOf(850), rankOf(905))
  for (const id of ['hat-trick', 'heater', 'original', 'inferno']) celebrate(BADGES.find((b) => b.id === id))
})
