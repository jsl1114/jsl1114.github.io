// tableart.mjs — casino-style table layouts, drawn as SVG to fit any size.
//
// The felt runs under the dealer at the top of the screen and ends in a curved
// edge on the player's side, wrapped in a rail, with a ruled arc across the
// middle as on a real table. No printed words: each theme is its felt,
// texture, ornament, rail and the room around it. Rank tables carry the rank's
// hexagon plate in the middle. Oak, the default, is the plain wooden table.

export const TABLE_THEMES = {
  coffeehouse: {
    felt: ['#b8753a', '#6f3d15'], room: '#1a0e07', texture: 'rings',
    ink: '#3b1f0e', rail: 'leather', railColors: ['#3a2112', '#1c0f07'], stitch: '#e9d3b0',
  },
  saloon: {
    felt: ['#b08355', '#5e3b1e'], room: '#20130a', texture: 'grain',
    ink: '#6b1d12', rail: 'planks', railColors: ['#8a6541', '#5b3d22'], stitch: '#2d1c0e',
  },
  harvest: {
    felt: ['#c97a2b', '#6e3508'], room: '#1c0d03', texture: 'leaves',
    ink: '#fff1d6', rail: 'leather', railColors: ['#5b3212', '#2e1806'], stitch: '#e0a35a',
  },
  canyon: {
    felt: ['#c2653a', '#6b2a12'], room: '#1d0b05', texture: 'mesas',
    ink: '#ffe6c7', rail: 'leather', railColors: ['#c8935d', '#7a5230'], stitch: '#4a2a14',
  },
  library: {
    felt: ['#355a3f', '#14231a'], room: '#120b06', texture: 'tooling',
    ink: '#d4af37', rail: 'leather', railColors: ['#6b2f16', '#361507'], stitch: '#d4af37',
  },
  riverboat: {
    felt: ['#8a2433', '#3a0a12'], room: '#12070a', texture: 'grain',
    ink: '#f2c96b', rail: 'brass', railColors: ['#f7dc8a', '#9a7220'], stitch: '#5c4210',
  },
  speakeasy: {
    felt: ['#3a2418', '#140a05'], room: '#060302', texture: 'deco',
    ink: '#c9a44c', rail: 'studs', railColors: ['#1e1510', '#0a0705'], stitch: '#c9a44c',
  },
  havana: {
    felt: ['#8a4b24', '#40200b'], room: '#150903', texture: 'band',
    ink: '#e8c170', rail: 'planks', railColors: ['#b0703f', '#6b3e1c'], stitch: '#3a1e0a',
  },
  chocolatier: {
    felt: ['#5a3120', '#24110a'], room: '#0f0603', texture: 'squares',
    ink: '#e7b75f', rail: 'leather', railColors: ['#7b4a2e', '#3b1f11'], stitch: '#e7b75f',
  },
  royal: {
    felt: ['#ffdb58', '#c8920e'], room: '#2a1409', texture: 'crowns',
    ink: '#492612', rail: 'leather', railColors: ['#5a2f16', '#2a1409'], stitch: '#ffdb58',
  },
  // Rank tables: the tier's metal in the rail and ornament, over a brown felt.
  'rank-bronze': {
    felt: ['#6b3f22', '#2e170a'], room: '#140903', texture: 'hex',
    ink: '#e3a36b', rail: 'metal', railColors: ['#f0b98a', '#7a4318'], stitch: '#4a260c', emblem: true,
  },
  'rank-silver': {
    felt: ['#5b4a3e', '#231a13'], room: '#110c08', texture: 'hex',
    ink: '#dfe5ea', rail: 'metal', railColors: ['#ffffff', '#7d8791'], stitch: '#3a3f44', emblem: true,
  },
  'rank-gold': {
    felt: ['#5e3a18', '#261406'], room: '#120902', texture: 'hex',
    ink: '#ffd24a', rail: 'metal', railColors: ['#fff0a8', '#a87812'], stitch: '#5c4210', emblem: true,
  },
  'rank-platinum': {
    felt: ['#3f4a3c', '#171c16'], room: '#0b0d0a', texture: 'hex',
    ink: '#8fe6d8', rail: 'metal', railColors: ['#d8fff8', '#2a8a7d'], stitch: '#1d4f48', emblem: true,
  },
  'rank-diamond': {
    felt: ['#3a3446', '#15121c'], room: '#08070c', texture: 'facets',
    ink: '#b9dcff', rail: 'metal', railColors: ['#eef7ff', '#3d6fb8'], stitch: '#1e3a66', emblem: true,
  },
  'rank-legend': {
    felt: ['#4a2440', '#1c0b18'], room: '#0c050a', texture: 'stars',
    ink: '#ffd76a', rail: 'metal', railColors: ['#ffe9a8', '#8a3fd1'], stitch: '#3a1466', emblem: true,
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
    case 'hex': // the rank plate's hexagon, as a faint repeat
      return [52, `<path d="M26 6 44 16v20L26 46 8 36V16z" fill="none" stroke="${ink}" stroke-opacity="0.09" stroke-width="1.5"/>`]
    case 'facets':
      return [48, `<path d="M24 2 46 24 24 46 2 24z M24 2V46M2 24H46" fill="none" stroke="${ink}" stroke-opacity="0.08"/>`]
    case 'stars':
      return [80, `<path d="M20 12l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="${ink}" fill-opacity="0.1"/><circle cx="60" cy="55" r="1.5" fill="${ink}" fill-opacity="0.25"/><circle cx="48" cy="20" r="1" fill="${ink}" fill-opacity="0.2"/>`]
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
  const shiny = kind === 'brass' || kind === 'metal'
  out += `<circle cx="${cx}" cy="${cy}" r="${r + width * 0.3}" fill="none" stroke="#fff" stroke-opacity="${shiny ? 0.45 : 0.12}" stroke-width="${width * 0.12}"/>`
  out += `<circle cx="${cx}" cy="${cy}" r="${r - width * 0.08}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="${width * 0.18}"/>`
  if (kind === 'planks') {
    out += `${arc} stroke="${stitch}" stroke-opacity="0.6" stroke-width="${width}" stroke-dasharray="2 ${width * 2.2}"/>`
  } else if (kind === 'studs') {
    out += `${arc} stroke="${stitch}" stroke-width="${width * 0.22}" stroke-linecap="round" stroke-dasharray="0.1 ${width * 0.9}"/>`
  } else if (kind === 'metal') {
    // A polished band with an inset groove.
    out += `<circle cx="${cx}" cy="${cy}" r="${r + width * 0.62}" fill="none" stroke="${stitch}" stroke-opacity="0.6" stroke-width="${Math.max(1, width * 0.06)}"/>`
  } else if (kind === 'leather') {
    out += `<circle cx="${cx}" cy="${cy}" r="${r + width * 0.5}" fill="none" stroke="${stitch}" stroke-opacity="0.75" stroke-width="${Math.max(1, width * 0.05)}" stroke-dasharray="${width * 0.22} ${width * 0.16}"/>`
  }
  return out
}

// An SVG string for `id` at width × height. `printAt` is the height (0–1) of
// the ruled arc: the gap between the dealer's and the player's cards.
// `detail: false` draws a thumbnail framed on the rail and the arc.
export function tableSVG(id, width, height, { detail = true, printAt = 0.5 } = {}) {
  const theme = TABLE_THEMES[id]
  if (!theme) return ''
  const n = ++uid
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const [tile, pattern] = texture(theme.texture, theme.ink)
  // The table edge is a big circle whose bottom sits just above the screen's
  // bottom edge, wide enough to run off both sides. A thumbnail uses a flatter
  // curve so its small frame still shows the edge and the arc.
  const r = detail ? Math.max(w * 0.75, h * 1.05) : w * 0.9
  const cx = w / 2
  const edge = detail ? h * 0.955 : h * 0.86
  const cy = edge - r
  // The ruled arc is concentric with the edge and crosses the centre at the
  // height asked for.
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
  // A ruled double arc across the middle of the felt, where a real table
  // prints its rules; rank tables set their plates on it.
  const stroke = Math.max(1, big * 0.08)
  for (const [radius, opacity] of [[lineR, 0.35], [lineR + big * 0.35, 0.2]]) {
    svg += `<path d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy}" fill="none" stroke="${theme.ink}" stroke-opacity="${opacity}" stroke-width="${stroke}"/>`
  }
  if (theme.emblem) {
    // The rank's hexagon plate, one on each side of the play area, sitting on
    // the ruled arc where a real table has its betting spots.
    const size = detail ? Math.min(Math.max(big * 1.5, 18), 40) : h * 0.26
    const dx = detail ? Math.min(Math.max(w * 0.3, 150), w / 2 - size - 12) : w * 0.3
    const hex = (x, y, k) => [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2
      return `${x + Math.cos(a) * size * k},${y + Math.sin(a) * size * k}`
    }).join(' ')
    // Filled with the tier's metal: a polished gradient, a bevelled inner plate
    // and a highlight across the top, like the rank emblem.
    const [light, dark] = theme.railColors
    svg += `<defs><linearGradient id="metal${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${theme.ink}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`
    svg += `<linearGradient id="bevel${n}" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>`
    for (const side of [-1, 1]) {
      const x = cx + side * dx
      const y = cy + Math.sqrt(Math.max(0, lineR * lineR - dx * dx))
      svg += `<polygon points="${hex(x, y + size * 0.08, 1.04)}" fill="#000" fill-opacity="0.35"/>`
      svg += `<polygon points="${hex(x, y, 1)}" fill="url(#metal${n})" stroke="${dark}" stroke-width="${stroke}"/>`
      svg += `<polygon points="${hex(x, y, 0.7)}" fill="url(#bevel${n})" stroke="${light}" stroke-opacity="0.7" stroke-width="${stroke}"/>`
      svg += `<ellipse cx="${x}" cy="${y - size * 0.42}" rx="${size * 0.5}" ry="${size * 0.14}" fill="#fff" fill-opacity="0.35"/>`
    }
  }
  svg += `</g>`
  svg += rail(theme.rail, theme.railColors, theme.stitch, cx, cy, r, railWidth, n)
  svg += `</svg>`
  return svg
}
