// dev-test.js — buttons that replay every celebration: rank-ups and badges (dev only).
import { BADGES, CATEGORIES, LEGEND_AT, POINTS_PER_DIVISION, rankOf } from './ranked.mjs'
import { celebrate, celebrateRank, celebrateUnlock, emblemElement, glyphElement } from './celebrate.mjs'
import { CARD_SOUND, audioContext, cardSound } from './sound.mjs'
import { CARD_BACKS, TABLES, byRank, progress } from './cosmetics.mjs'
import { tableSVG } from './tableart.mjs'
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
const empty = { profile: newProfile() }
const unlockButton = (item, kind) => {
  const icon = document.createElement('span')
  icon.className = 'dev-swatch'
  if (kind === 'table') icon.innerHTML = tableSVG(item.id, 44, 44, { detail: false })
  else icon.style.backgroundImage = `url('./assets/cards/${item.file}')`
  return devButton(icon, `${item.name} · ${kind}`, () => celebrateUnlock(item, kind, progress(item, empty).text))
}
document.getElementById('unlocks').append(
  ...TABLES.filter((t) => t.unlock[1] > 0).map((t) => unlockButton(t, 'table')),
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

// ---- Sound lab ------------------------------------------------------------------

const SLIDERS = [
  ['clickMs', 'Click length (ms)', 2, 40, 1],
  ['clickHz', 'Click brightness (Hz)', 400, 8000, 100],
  ['clickDecay', 'Click crispness', 1, 20, 0.5],
  ['clickLevel', 'Click volume', 0, 1.5, 0.05],
  ['thudHz', 'Thud pitch (Hz)', 50, 400, 5],
  ['thudMs', 'Thud length (ms)', 10, 150, 5],
  ['thudLevel', 'Thud volume', 0, 1.5, 0.05],
  ['vary', 'Card-to-card variation', 0, 0.4, 0.01],
]
const PRESETS = {
  'Current default': { ...CARD_SOUND },
  'Crisp snap': { clickMs: 5, clickHz: 5200, clickDecay: 9, clickLevel: 1, thudHz: 180, thudMs: 25, thudLevel: 0.3, vary: 0.1 },
  'Old (burner)': { clickMs: 60, clickHz: 8000, clickDecay: 1, clickLevel: 0.9, thudHz: 150, thudMs: 10, thudLevel: 0, vary: 0 },
}
const lab = { ...CARD_SOUND }
const labEl = document.getElementById('sound-lab')
const status = document.getElementById('lab-status')

function renderLab() {
  labEl.replaceChildren(
    ...SLIDERS.flatMap(([key, label, min, max, step]) => {
      const name = Object.assign(document.createElement('label'), { textContent: label, htmlFor: `lab-${key}` })
      const input = Object.assign(document.createElement('input'), { type: 'range', id: `lab-${key}`, min, max, step, value: lab[key] })
      const value = Object.assign(document.createElement('output'), { textContent: lab[key] })
      input.addEventListener('input', () => {
        lab[key] = Number(input.value)
        value.textContent = input.value
      })
      input.addEventListener('change', () => playLab(1))
      return [name, input, value]
    }),
  )
}

function playLab(cards) {
  const ctx = audioContext()
  if (!ctx) {
    status.textContent = 'Sound is off: turn it on in the game’s Settings.'
    return
  }
  for (let i = 0; i < cards; i++) cardSound(ctx, i * 0.16, lab)
}

document.getElementById('sound-presets').append(
  ...Object.entries(PRESETS).map(([name, preset]) => {
    const button = Object.assign(document.createElement('button'), { type: 'button', className: 'dev-btn plain', textContent: name })
    button.addEventListener('click', () => {
      Object.assign(lab, preset)
      renderLab()
      playLab(4)
    })
    return button
  }),
)
document.getElementById('lab-one').addEventListener('click', () => playLab(1))
document.getElementById('lab-deal').addEventListener('click', () => playLab(4))
document.getElementById('lab-copy').addEventListener('click', async () => {
  const text = `BrownJack card sound: ${JSON.stringify(lab)}`
  try {
    await navigator.clipboard.writeText(text)
    status.textContent = 'Copied. Paste it into the chat.'
  } catch {
    status.textContent = text
  }
})
renderLab()
