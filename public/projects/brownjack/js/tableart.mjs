// tableart.mjs — casino-style table layouts, drawn as SVG to fit any size.
//
// The felt runs under the dealer at the top of the screen and ends in a curved
// edge on the player's side, wrapped in a padded rail; the house rules are
// printed in arcs between the dealer and the player, as on a real table. Each
// theme sets the felt, its texture, the printing, the rail and the room around
// it. Oak, the default, has no layout: it's the plain wooden table.

const SERIF = "Georgia, 'Times New Roman', serif"

export const TABLE_THEMES = {
  coffeehouse: {
    felt: ['#b8753a', '#6f3d15'], room: '#1a0e07', texture: 'rings',
    ink: '#3b1f0e', rail: 'leather', railColors: ['#3a2112', '#1c0f07'], stitch: '#e9d3b0',
    title: 'COFFEEHOUSE', line: 'BLACKJACK PAYS 3 TO 2', rules: 'HOUSE BLEND · DEALER STANDS ON ALL 17s',
  },
  saloon: {
    felt: ['#b08355', '#5e3b1e'], room: '#20130a', texture: 'grain',
    ink: '#6b1d12', rail: 'planks', railColors: ['#8a6541', '#5b3d22'], stitch: '#2d1c0e',
    title: '★ SALOON ★', line: 'BLACKJACK PAYS 3 TO 2', rules: 'NO SPURS AT THE TABLE · DEALER STANDS ON 17',
  },
  harvest: {
    felt: ['#c97a2b', '#6e3508'], room: '#1c0d03', texture: 'leaves',
    ink: '#fff1d6', rail: 'leather', railColors: ['#5b3212', '#2e1806'], stitch: '#e0a35a',
    title: 'HARVEST TABLE', line: 'BLACKJACK PAYS 3 TO 2', rules: 'DEALER STANDS ON ALL 17s · INSURANCE PAYS 2 TO 1',
  },
  canyon: {
    felt: ['#c2653a', '#6b2a12'], room: '#1d0b05', texture: 'mesas',
    ink: '#ffe6c7', rail: 'leather', railColors: ['#c8935d', '#7a5230'], stitch: '#4a2a14',
    title: 'RED CANYON', line: 'BLACKJACK PAYS 3 TO 2', rules: 'DEALER STANDS ON ALL 17s',
  },
  library: {
    felt: ['#355a3f', '#14231a'], room: '#120b06', texture: 'tooling',
    ink: '#d4af37', rail: 'leather', railColors: ['#6b2f16', '#361507'], stitch: '#d4af37',
    title: 'THE READING ROOM', line: 'BLACKJACK PAYS 3 TO 2', rules: 'QUIET PLEASE · DEALER STANDS ON ALL 17s',
  },
  riverboat: {
    felt: ['#8a2433', '#3a0a12'], room: '#12070a', texture: 'grain',
    ink: '#f2c96b', rail: 'brass', railColors: ['#f7dc8a', '#9a7220'], stitch: '#5c4210',
    title: 'RIVERBOAT', line: 'BLACKJACK PAYS 3 TO 2', rules: 'ALL ABOARD · DEALER STANDS ON ALL 17s',
  },
  speakeasy: {
    felt: ['#3a2418', '#140a05'], room: '#060302', texture: 'deco',
    ink: '#c9a44c', rail: 'studs', railColors: ['#1e1510', '#0a0705'], stitch: '#c9a44c',
    title: 'SPEAKEASY', line: 'BLACKJACK PAYS 3 TO 2', rules: 'MEMBERS ONLY · DEALER STANDS ON ALL 17s',
  },
  havana: {
    felt: ['#8a4b24', '#40200b'], room: '#150903', texture: 'band',
    ink: '#e8c170', rail: 'planks', railColors: ['#b0703f', '#6b3e1c'], stitch: '#3a1e0a',
    title: 'HAVANA CLUB', line: 'BLACKJACK PAYS 3 TO 2', rules: 'HAND ROLLED · DEALER STANDS ON ALL 17s',
  },
  chocolatier: {
    felt: ['#5a3120', '#24110a'], room: '#0f0603', texture: 'squares',
    ink: '#e7b75f', rail: 'leather', railColors: ['#7b4a2e', '#3b1f11'], stitch: '#e7b75f',
    title: 'CHOCOLATIER', line: 'BLACKJACK PAYS 3 TO 2', rules: 'SEVENTY PERCENT DARK · DEALER STANDS ON ALL 17s',
  },
  royal: {
    felt: ['#ffdb58', '#c8920e'], room: '#2a1409', texture: 'crowns',
    ink: '#492612', rail: 'leather', railColors: ['#5a2f16', '#2a1409'], stitch: '#ffdb58',
    title: '♛ BROWNJACK ROYAL ♛', line: 'BLACKJACK PAYS 3 TO 2', rules: 'THE HOUSE OF JASON · DEALER STANDS ON ALL 17s',
  },
}

let uid = 0

// Textures on the felt, as SVG pattern contents (plus their tile size).
function texture(kind, ink) {
  switch (kind) {
    case 'rings': // coffee cup rings
      return [120, `<circle cx="36" cy="40" r="22" fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="4"/><circle cx="92" cy="96" r="16" fill="none" stroke="${ink}" stroke-opacity="0.08" stroke-width="3"/>`]
    case 'leaves':
      return [90, `<path d="M20 30c10-14 26-14 32 0-8 12-22 14-32 0z" fill="${ink}" fill-opacity="0.1" transform="rotate(-25 36 30)"/><path d="M60 72c8-11 20-11 25 0-6 9-17 11-25 0z" fill="${ink}" fill-opacity="0.08" transform="rotate(35 72 72)"/>`]
    case 'mesas':
      return [160, `<path d="M0 150h30l10-24h40l8 24h72" fill="none" stroke="${ink}" stroke-opacity="0.08" stroke-width="3"/>`]
    case 'tooling':
      return [40, `<path d="M20 4l16 16-16 16L4 20z" fill="none" stroke="${ink}" stroke-opacity="0.12"/>`]
    case 'deco':
      return [60, `<path d="M0 60a30 30 0 0 1 60 0M10 60a20 20 0 0 1 40 0M20 60a10 10 0 0 1 20 0" fill="none" stroke="${ink}" stroke-opacity="0.12"/>`]
    case 'band':
      return [28, `<path d="M0 14h28" stroke="${ink}" stroke-opacity="0.07" stroke-width="10"/>`]
    case 'squares':
      return [46, `<rect x="3" y="3" width="40" height="40" rx="4" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="2"/><rect x="5" y="5" width="36" height="36" rx="3" fill="none" stroke="#fff" stroke-opacity="0.05"/>`]
    case 'crowns':
      return [70, `<path d="M20 44l4-16 8 9 8-13 8 13 8-9 4 16z" fill="${ink}" fill-opacity="0.07"/>`]
    default: // fine felt grain
      return [6, `<rect width="3" height="3" fill="#fff" fill-opacity="0.025"/><rect x="3" y="3" width="3" height="3" fill="#000" fill-opacity="0.05"/>`]
  }
}

// The padded rail along the table's curved edge.
function rail(kind, colors, stitch, cx, cy, r, width, id) {
  const [light, dark] = colors
  const arc = `<circle cx="${cx}" cy="${cy}" r="${r + width / 2}" fill="none"`
  let out = `<defs><linearGradient id="rail${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`
  out += `${arc} stroke="url(#rail${id})" stroke-width="${width}"/>`
  // A highlight along the top of the padding, and a shadow onto the felt.
  out += `<circle cx="${cx}" cy="${cy}" r="${r + width * 0.3}" fill="none" stroke="#fff" stroke-opacity="${kind === 'brass' ? 0.45 : 0.12}" stroke-width="${width * 0.12}"/>`
  out += `<circle cx="${cx}" cy="${cy}" r="${r - width * 0.08}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="${width * 0.18}"/>`
  if (kind === 'planks') {
    out += `${arc} stroke="${stitch}" stroke-opacity="0.6" stroke-width="${width}" stroke-dasharray="2 ${width * 2.2}"/>`
  } else if (kind === 'studs') {
    out += `${arc} stroke="${stitch}" stroke-width="${width * 0.22}" stroke-linecap="round" stroke-dasharray="0.1 ${width * 0.9}"/>`
  } else if (kind === 'leather') {
    out += `<circle cx="${cx}" cy="${cy}" r="${r + width * 0.5}" fill="none" stroke="${stitch}" stroke-opacity="0.75" stroke-width="${Math.max(1, width * 0.05)}" stroke-dasharray="${width * 0.22} ${width * 0.16}"/>`
  }
  return out
}

// Text on an arc of radius `r` around (cx, cy), centred on the bottom of the arc.
function arcText(text, cx, cy, r, size, ink, id, { opacity = 0.8, spacing = 0.18, weight = 700 } = {}) {
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`
  return (
    `<path id="arc${id}" d="${path}" fill="none"/>` +
    // Inline styles on both: the page's `*` font rule would otherwise win.
    `<text style="font-family: ${SERIF}" font-size="${size}" font-weight="${weight}" letter-spacing="${size * spacing}" fill="${ink}" fill-opacity="${opacity}">` +
    `<textPath href="#arc${id}" startOffset="50%" text-anchor="middle" style="font-family: ${SERIF}">${text}</textPath></text>`
  )
}

// An SVG string for `id` at width × height. `printAt` is the height (0–1) where
// the main line of print should sit — the gap between the dealer's and the
// player's cards. `detail: false` draws a thumbnail: the printing up close.
export function tableSVG(id, width, height, { detail = true, printAt = 0.5 } = {}) {
  const theme = TABLE_THEMES[id]
  if (!theme) return ''
  const n = ++uid
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const [tile, pattern] = texture(theme.texture, theme.ink)
  // The table edge is a big circle whose bottom sits just above the screen's
  // bottom edge, wide enough to run off both sides. A thumbnail uses a flatter
  // curve so its small frame still shows the edge and the printing.
  const r = detail ? Math.max(w * 0.75, h * 1.05) : w * 0.9
  const cx = w / 2
  const edge = detail ? h * 0.955 : h * 0.86
  const cy = edge - r
  // The printed arcs are concentric with the edge; the main line crosses the
  // centre at the height asked for.
  const lineR = (detail ? h * printAt : h * 0.52) - cy
  const railWidth = detail ? Math.min(Math.max(h * 0.032, 12), 32) : Math.max(h * 0.09, 4)
  const big = detail ? Math.min(Math.max(Math.min(w, h * 1.4) * 0.032, 12), 30) : h * 0.2

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">`
  svg += `<defs><radialGradient id="felt${n}" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="${theme.felt[0]}"/><stop offset="1" stop-color="${theme.felt[1]}"/></radialGradient>`
  svg += `<pattern id="tex${n}" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">${pattern}</pattern>`
  svg += `<radialGradient id="glow${n}" cx="50%" cy="42%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity="0.09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
  svg += `<clipPath id="table${n}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>`
  svg += `<rect width="${w}" height="${h}" fill="${theme.room}"/>`
  svg += `<g clip-path="url(#table${n})"><rect width="${w}" height="${h}" fill="url(#felt${n})"/><rect width="${w}" height="${h}" fill="url(#tex${n})"/>`
  // A soft pool of light over the middle of the felt.
  svg += `<rect width="${w}" height="${h}" fill="url(#glow${n})"/>`
  if (detail) {
    // The printed layout: the main line with the house rules just above it, a
    // ruled arc under both, and the table's name low on the felt by the rail.
    // Printed into the felt: soft enough that the cards read cleanly on top.
    svg += arcText(theme.rules, cx, cy, lineR - big * 1.15, big * 0.46, theme.ink, `${n}b`, { opacity: 0.4, spacing: 0.22 })
    svg += arcText(theme.line, cx, cy, lineR, big, theme.ink, `${n}a`, { opacity: 0.55 })
    svg += `<path d="M ${cx - lineR - big * 0.7} ${cy} A ${lineR + big * 0.7} ${lineR + big * 0.7} 0 0 0 ${cx + lineR + big * 0.7} ${cy}" fill="none" stroke="${theme.ink}" stroke-opacity="0.3" stroke-width="${Math.max(1, big * 0.07)}"/>`
    svg += arcText(theme.title, cx, cy, r - railWidth * 0.9 - big * 0.2, big * 0.56, theme.ink, `${n}c`, { opacity: 0.5, spacing: 0.35 })
  } else {
    svg += arcText('BLACKJACK', cx, cy, lineR, big, theme.ink, `${n}a`, { opacity: 0.75, spacing: 0.12 })
  }
  svg += `</g>`
  svg += rail(theme.rail, theme.railColors, theme.stitch, cx, cy, r, railWidth, n)
  svg += `</svg>`
  return svg
}
