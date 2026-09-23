// dev-test.js — buttons that replay every celebration: rank-ups and badges (dev only).
import { BADGES, CATEGORIES, LEGEND_AT, POINTS_PER_DIVISION, rankOf } from './ranked.mjs'
import { celebrate, celebrateRank, emblemElement, glyphElement } from './celebrate.mjs'

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
