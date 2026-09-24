// sharecard.mjs — draws a finished hand as an image to share: the cards, the
// result, what the hand earned, how likely it was with its grade, and a link.
//
// It draws from a hand record, which the Hall of Fame keeps too, so an old hand
// can be drawn again later:
//   { at, mode: 'ranked' | 'daily' | 'rigged', label,
//     hands: [{ cards, winner, doubled }], dealer: cards,
//     delta: RP won or lost (ranked only), rankUp: { from, to } rank names or null,
//     earned: badge ids, unlocks: table and card-back ids,
//     chance, grade, reason: from rateHand (null when rigged),
//     place: its Hall of Fame place, if any }
import { handValue, isBlackjack } from './blackjack.mjs'
import { badgeById } from './badges.mjs'
import { CARD_BACKS, TABLES } from './cosmetics.mjs'
import { featureName, oneIn } from './handodds.mjs'
import { tableSVG } from './tableart.mjs'

export const GAME_URL = 'https://jsl1114.github.io/projects/brownjack/game.html'
const SHOWN_URL = 'jsl1114.github.io/projects/brownjack'

const W = 1080
const PAD = 64
const INNER = W - PAD * 2
const FONT = "'Kode Mono', ui-monospace, monospace"
const COLORS = { cream: '#faebd7', bark: '#492612', walnut: '#7b5234', mustard: '#ffdb58' }
const RING = { Common: '#6aa84f', Rare: '#4a90e2', Epic: '#a45cff', Legendary: '#ffb800' }
// Grade medal colours: [fill, text].
const GRADE_COLORS = {
  SSS: ['#ffb800', '#3a1d00'],
  SS: ['#a45cff', '#fff'],
  S: ['#4a90e2', '#fff'],
  A: ['#6aa84f', '#fff'],
  B: ['#2f8f83', '#fff'],
  C: ['#8a8f98', '#fff'],
  D: ['#7b5234', '#faebd7'],
}
const RANK_NAMES = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' }
const RESULT = { player: 'Win', dealer: 'Loss', push: 'Push' }

const cardFile = ({ rank, suit }) => `./assets/cards/${RANK_NAMES[rank] ?? rank}_of_${suit}.png`

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

const svgImage = (svg) => loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke[0]
    ctx.lineWidth = stroke[1]
    ctx.stroke()
  }
}

function text(ctx, value, x, y, { size = 32, weight = 500, color = COLORS.cream, align = 'left', spacing = 0 } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.letterSpacing = `${spacing}px`
  ctx.fillText(value, x, y)
  ctx.letterSpacing = '0px'
}

// Word-wrapped lines that fit `width` at the given size.
function wrap(ctx, value, width, size, weight = 500) {
  ctx.font = `${weight} ${size}px ${FONT}`
  const lines = []
  let line = ''
  for (const word of value.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

// A badge medal: rarity ring, bark centre, mustard glyph.
function medal(ctx, badge, cx, cy, r) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = COLORS.bark
  ctx.fill()
  ctx.lineWidth = r * 0.16
  ctx.strokeStyle = RING[badge.rarity]
  ctx.stroke()
  const size = badge.glyph.length > 3 ? r * 0.5 : r * 0.72
  ctx.font = `700 ${size}px ${FONT}`
  ctx.fillStyle = COLORS.mustard
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(badge.glyph, cx, cy + size * 0.05, r * 1.6)
}

export function headline(record) {
  const winners = record.hands.map((h) => h.winner)
  const won = winners.filter((w) => w === 'player').length
  const lost = winners.filter((w) => w === 'dealer').length
  if (record.hands.length === 1 && isBlackjack(record.hands[0].cards) && won) return 'Blackjack!'
  // A split that went both ways reads better as its two results.
  if (won && lost) return `${won} win · ${lost} loss`
  if (won > lost) return 'You win'
  if (lost > won) return record.hands.every((h) => handValue(h.cards).total > 21) ? 'Bust' : 'Dealer wins'
  return 'Push'
}

// Each block of the card: its height, and how to draw it at a given y.
function blocks(ctx, record, images) {
  const list = []
  const add = (height, draw) => list.push({ height, draw })

  // Header: the BrownJack plate, and the mode and date.
  add(140, (y) => {
    ctx.font = `700 56px ${FONT}`
    const plate = ctx.measureText('BrownJack').width + 56
    roundRect(ctx, PAD, y, plate, 96, 20, COLORS.mustard)
    text(ctx, 'BrownJack', PAD + 28, y + 66, { size: 56, weight: 700, color: COLORS.bark })
    text(ctx, record.label, W - PAD, y + 42, { size: 30, weight: 700, align: 'right' })
    const date = new Date(record.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    text(ctx, date, W - PAD, y + 82, { size: 24, align: 'right', color: 'rgb(250 235 215 / 0.75)' })
  })

  // A labelled row of cards, overlapping to fit.
  const row = (label, cards, cardW) => {
    const cardH = Math.round(cardW * 1.452)
    add(52 + cardH + 28, (y) => {
      text(ctx, label, PAD, y + 34, { size: 28, weight: 700, color: COLORS.mustard, spacing: 3 })
      const step = cards.length > 1 ? Math.min(cardW + 16, (INNER - cardW) / (cards.length - 1)) : 0
      cards.forEach((card, i) => {
        const x = PAD + i * step
        ctx.save()
        ctx.shadowColor = 'rgb(0 0 0 / 0.45)'
        ctx.shadowBlur = 18
        ctx.shadowOffsetY = 6
        roundRect(ctx, x, y + 52, cardW, cardH, cardW * 0.06, '#fff')
        ctx.restore()
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(x, y + 52, cardW, cardH, cardW * 0.06)
        ctx.clip()
        ctx.drawImage(images.get(cardFile(card)), x, y + 52, cardW, cardH)
        ctx.restore()
      })
    })
  }
  const split = record.hands.length > 1
  row(`DEALER · ${handValue(record.dealer).total}`, record.dealer, split ? 150 : 170)
  record.hands.forEach((hand, i) => {
    const name = split ? `HAND ${i + 1}` : 'YOU'
    const tags = [handValue(hand.cards).total, ...(hand.doubled ? ['DOUBLED'] : []), ...(split ? [RESULT[hand.winner].toUpperCase()] : [])]
    row(`${name} · ${tags.join(' · ')}`, hand.cards, split ? 150 : 200)
  })

  // The result, with the RP it moved for ranked.
  add(120, (y) => {
    text(ctx, headline(record), PAD, y + 76, { size: 76, weight: 700 })
    if (record.delta != null) {
      const rp = `${record.delta > 0 ? '+' : record.delta < 0 ? '−' : '±'}${Math.abs(record.delta)} RP`
      ctx.font = `700 40px ${FONT}`
      const w = ctx.measureText(rp).width + 48
      roundRect(ctx, W - PAD - w, y + 22, w, 68, 34, record.delta >= 0 ? COLORS.mustard : 'rgb(0 0 0 / 0.45)')
      text(ctx, rp, W - PAD - w / 2, y + 70, { size: 40, weight: 700, align: 'center', color: record.delta >= 0 ? COLORS.bark : COLORS.cream })
    }
  })

  // The odds and the grade, on a cream panel.
  const oddsNote = record.grade
    ? `${featureName(record.reason)}: comes up about once in ${Math.round(1 / record.chance).toLocaleString('en-US')} hands.`
    : 'Rigged deck: a practice hand, so it isn’t graded.'
  const noteLines = wrap(ctx, oddsNote, INNER - 300, 26)
  const oddsH = Math.max(250, 150 + noteLines.length * 36)
  add(oddsH + 32, (y) => {
    roundRect(ctx, PAD, y, INNER, oddsH, 28, COLORS.cream)
    const [fill, ink] = record.grade ? GRADE_COLORS[record.grade] : ['#b9ab98', COLORS.bark]
    const cx = PAD + 130
    const cy = y + oddsH / 2
    ctx.beginPath()
    ctx.arc(cx, cy, 92, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = 'rgb(255 255 255 / 0.6)'
    ctx.stroke()
    const grade = record.grade ?? '—'
    ctx.font = `700 ${grade.length > 2 ? 64 : grade.length > 1 ? 80 : 104}px ${FONT}`
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(grade, cx, cy + 6)
    const left = PAD + 270
    text(ctx, record.grade ? 'RARITY' : 'PRACTICE', left, y + 64, { size: 24, weight: 700, color: COLORS.walnut, spacing: 3 })
    text(ctx, record.grade ? `${oneIn(record.chance)} hands` : 'No grade', left, y + 128, { size: 54, weight: 700, color: COLORS.bark })
    noteLines.forEach((line, i) => text(ctx, line, left, y + 178 + i * 36, { size: 26, color: COLORS.walnut }))
  })

  // What the hand earned: a promotion, badges and unlocks.
  const badges = record.earned.map(badgeById).filter(Boolean)
  const unlocks = record.unlocks
    .map((id) => {
      const table = TABLES.find((t) => t.id === id)
      const back = CARD_BACKS.find((b) => b.id === id)
      return table ? `${table.name} table` : back ? `${back.name} card back` : null
    })
    .filter(Boolean)
  const extras = [
    ...(record.rankUp ? [`Promoted: ${record.rankUp.from} → ${record.rankUp.to}`] : []),
    ...(unlocks.length ? [`Unlocked: ${unlocks.join(', ')}`] : []),
    ...(record.place ? [`★ #${record.place} in the Hall of Fame`] : []),
  ]
  if (badges.length || extras.length) {
    const perRow = 5
    const shown = badges.slice(0, perRow * 2)
    const badgeRows = Math.ceil(shown.length / perRow)
    const extraLines = extras.flatMap((line) => wrap(ctx, line, INNER - 80, 28, 700))
    const h = 84 + badgeRows * 200 + extraLines.length * 42 + 24
    add(h + 32, (y) => {
      roundRect(ctx, PAD, y, INNER, h, 28, 'rgb(0 0 0 / 0.5)')
      text(ctx, 'EARNED THIS HAND', PAD + 40, y + 58, { size: 24, weight: 700, color: COLORS.mustard, spacing: 3 })
      const cell = (INNER - 80) / perRow
      shown.forEach((badge, i) => {
        const cx = PAD + 40 + cell * (i % perRow) + cell / 2
        const top = y + 84 + Math.floor(i / perRow) * 200
        medal(ctx, badge, cx, top + 62, 56)
        wrap(ctx, badge.name, cell - 12, 22, 700).slice(0, 2).forEach((line, j) =>
          text(ctx, line, cx, top + 158 + j * 26, { size: 22, weight: 700, align: 'center' }))
      })
      if (badges.length > shown.length) {
        text(ctx, `+${badges.length - shown.length} more`, W - PAD - 40, y + 58, { size: 24, align: 'right' })
      }
      extraLines.forEach((line, i) => text(ctx, line, PAD + 40, y + 84 + badgeRows * 200 + 30 + i * 42, { size: 28, weight: 700 }))
    })
  }

  // The link.
  add(110, (y) => {
    ctx.fillStyle = 'rgb(250 235 215 / 0.25)'
    ctx.fillRect(PAD, y + 8, INNER, 2)
    text(ctx, 'Play BrownJack', PAD, y + 68, { size: 30, weight: 700 })
    text(ctx, SHOWN_URL, W - PAD, y + 68, { size: 30, weight: 700, color: COLORS.mustard, align: 'right' })
  })
  return list
}

// Draw the record onto a new canvas, on the player's table.
export async function drawShareCard(record, { tableId = 'oak' } = {}) {
  await document.fonts?.load(`700 40px ${FONT}`)
  const files = [...new Set([...record.dealer, ...record.hands.flatMap((h) => h.cards)].map(cardFile))]
  const images = new Map(await Promise.all(files.map(async (file) => [file, await loadImage(file)])))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const list = blocks(ctx, record, images)
  const H = PAD * 1.25 + list.reduce((sum, b) => sum + b.height, 0) + PAD * 0.5
  canvas.width = W
  canvas.height = Math.round(H)

  // The table: Oak is the wood photo, the rest their layouts.
  const svg = tableId === 'oak' ? '' : tableSVG(tableId, W, canvas.height, { detail: false })
  if (svg) {
    ctx.drawImage(await svgImage(svg), 0, 0, W, canvas.height)
  } else {
    const wood = await loadImage('./assets/bg.jpg')
    const scale = Math.max(W / wood.width, canvas.height / wood.height)
    ctx.drawImage(wood, (W - wood.width * scale) / 2, (canvas.height - wood.height * scale) / 2, wood.width * scale, wood.height * scale)
  }
  const shade = ctx.createLinearGradient(0, 0, 0, canvas.height)
  shade.addColorStop(0, 'rgb(0 0 0 / 0.35)')
  shade.addColorStop(1, 'rgb(0 0 0 / 0.6)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, W, canvas.height)

  let y = PAD * 1.25
  for (const block of list) {
    block.draw(y)
    y += block.height
  }
  return canvas
}

export const canvasBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
