// ranked.mjs — rank points, tiers, bonuses and badges. Pure: no DOM, no storage.
import { handValue, isBlackjack } from './blackjack.mjs'
import { BADGES, awardBadges } from './badges.mjs'

export const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
export const DIVISIONS = ['I', 'II', 'III']
export const POINTS_PER_DIVISION = 100
// Rank points are one running total; every 100 is a division, and past
// Diamond III every 100 is a Legend star.
export const LEGEND_AT = TIERS.length * DIVISIONS.length * POINTS_PER_DIVISION

// Indexed by tier (Legend is 5). Wins shrink and losses grow as you climb.
// Tuned by simulating basic-strategy play: roughly 10, 15, 25, 38 and 60 hands
// per division from Bronze to Diamond, then about 115 hands per Legend star.
export const WIN_POINTS = [30, 25, 22, 21, 20, 19]
export const LOSS_POINTS = [8, 11, 14, 16, 17, 18]

export const BONUS = {
  blackjack: 10, // a natural on the deal
  daredevil: 12, // won after hitting on a hard 17 or more
  charlie: 15, // won holding five or more cards
  streakStep: 3, // per win past the second in a row
  streakCap: 15,
}

export { BADGES, CATEGORIES } from './badges.mjs'
export const SHOWCASE_SIZE = 5

export const newProfile = () => ({
  rp: 0,
  peakRp: 0,
  games: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  streak: 0,
  bestStreak: 0,
  lossStreak: 0,
  blackjacks: 0,
  daredevilWins: 0,
  // Hit/stand decisions checked against basic strategy, and the run of hands
  // played without a single mistake.
  decisions: 0,
  goodDecisions: 0,
  textbookStreak: 0,
  bestTextbookStreak: 0,
  // The current season (0 until the first one is joined), its best RP and hands,
  // and a medal for every finished season: { id, peakRp, finalRp }.
  season: 0,
  seasonPeakRp: 0,
  seasonGames: 0,
  seasons: [],
  badges: {},
  showcase: [],
})

export function rankOf(rp) {
  if (rp >= LEGEND_AT) {
    const stars = Math.floor((rp - LEGEND_AT) / POINTS_PER_DIVISION)
    return {
      tierIndex: TIERS.length,
      tier: 'Legend',
      division: null,
      name: `Legend ★${stars}`,
      stars,
      progress: (rp - LEGEND_AT) % POINTS_PER_DIVISION,
    }
  }
  const step = Math.floor(rp / POINTS_PER_DIVISION)
  const tierIndex = Math.floor(step / DIVISIONS.length)
  const division = DIVISIONS[step % DIVISIONS.length]
  return {
    tierIndex,
    tier: TIERS[tierIndex],
    division,
    name: `${TIERS[tierIndex]} ${division}`,
    stars: 0,
    progress: rp % POINTS_PER_DIVISION,
  }
}

// `round` describes a finished hand:
//   { hands: [{ cards, winner, doubled, riskyHit, needle }], dealer, forfeit, stake, stacked,
//     at, sessionHands, firstInShoe, lastInShoe, decisions }
// (or a single hand as { player, winner, riskyHit, needle }). winner is 'player' | 'dealer' | 'push'.
// riskyHit: the player hit on a hard 17+; needle: that hit was on 18+ and landed on 21.
// stake: bets at risk when a hand is abandoned (a double counts two).
// at: when the hand finished (for time-based badges); sessionHands: ranked hands this sitting.
// firstInShoe / lastInShoe: the hand opened a new shoe / was the last before a reshuffle.
// decisions: one boolean per hit/stand choice, true when it matched basic strategy.
export function scoreRound(profile, round) {
  const before = rankOf(profile.rp)
  // Hard rule: a hand dealt from a deck the player arranged never moves rank
  // points, stats, streaks or badges.
  if (round.stacked) {
    return {
      profile,
      delta: 0,
      lines: [{ label: 'Rigged game', points: 0 }],
      earned: [],
      before,
      after: before,
      unranked: true,
    }
  }

  const next = { ...profile, badges: { ...profile.badges } }
  const lines = []
  const dealer = round.dealer ?? []
  // A hand is one or two player hands (after a split). Older callers pass a
  // single `player` hand with its `winner`.
  const hands = round.hands ?? (round.player ? [{ cards: round.player, winner: round.winner, riskyHit: round.riskyHit, needle: round.needle }] : [])
  const split = hands.length > 1
  const dealt = hands.length ? (split ? [hands[0].cards[0], hands[1].cards[0]] : hands[0].cards.slice(0, 2)) : []
  const natural = !split && hands.length === 1 && isBlackjack(hands[0].cards)
  const handsWon = hands.filter((h) => h.winner === 'player').length
  const handsLost = hands.filter((h) => h.winner === 'dealer').length
  // The hand's overall result, for stats and streaks: more hands won than lost is a win.
  const overall = round.forfeit ? 'dealer' : handsWon > handsLost ? 'player' : handsLost > handsWon ? 'dealer' : 'push'

  next.games++
  next.seasonGames = (next.seasonGames ?? 0) + 1
  if (natural) next.blackjacks++
  // Hands with no choice to make (a natural, say) neither extend nor break the run.
  const decisions = round.decisions ?? []
  if (decisions.length) {
    next.decisions += decisions.length
    next.goodDecisions += decisions.filter(Boolean).length
    next.textbookStreak = decisions.every(Boolean) ? next.textbookStreak + 1 : 0
    next.bestTextbookStreak = Math.max(next.bestTextbookStreak, next.textbookStreak)
  }

  if (overall === 'player') {
    next.wins++
    next.streak++
    next.lossStreak = 0
  } else if (overall === 'dealer') {
    next.losses++
    next.streak = 0
    next.lossStreak++
  } else {
    next.pushes++
  }

  if (round.forfeit) {
    // Leaving mid-hand costs whatever was at stake, doubles and splits included.
    lines.push({ label: 'Abandoned hand', points: -LOSS_POINTS[before.tierIndex] * (round.stake ?? 1) })
  }
  hands.forEach((hand, i) => {
    const stake = hand.doubled ? 2 : 1
    const name = split ? `Hand ${i + 1} ` : ''
    const kind = hand.doubled ? 'double ' : ''
    const label = (result) => `${name}${kind}${result}`.replace(/^./, (c) => c.toUpperCase())
    if (hand.winner === 'player') {
      lines.push({ label: label('win'), points: WIN_POINTS[before.tierIndex] * stake })
      if (hand.riskyHit) {
        next.daredevilWins++
        lines.push({ label: 'Daredevil', points: BONUS.daredevil })
      }
      if (hand.cards.length >= 5) lines.push({ label: 'Five-card Charlie', points: BONUS.charlie })
    } else if (hand.winner === 'dealer') {
      lines.push({ label: label('loss'), points: -LOSS_POINTS[before.tierIndex] * stake })
    } else {
      lines.push({ label: label('push'), points: 0 })
    }
  })
  if (overall === 'player') {
    if (natural) lines.splice(1, 0, { label: 'Blackjack', points: BONUS.blackjack })
    const streakBonus = Math.min(BONUS.streakCap, BONUS.streakStep * (next.streak - 2))
    if (streakBonus > 0) lines.push({ label: `${next.streak} in a row`, points: streakBonus })
  }

  const delta = lines.reduce((sum, line) => sum + line.points, 0)
  next.rp = Math.max(0, profile.rp + delta)
  next.peakRp = Math.max(profile.peakRp, next.rp)
  next.seasonPeakRp = Math.max(profile.seasonPeakRp ?? 0, next.rp)
  next.bestStreak = Math.max(profile.bestStreak, next.streak)

  const after = rankOf(next.rp)
  const dv = handValue(dealer).total
  // Badges are checked against each of the player's hands; one that passes for
  // either hand is awarded once.
  const base = { overall, natural, dealt, split, handsWon, dealer, dv, round, profile, after, peak: rankOf(next.peakRp) }
  const contexts = hands.length
    ? hands.map((hand) => ({
        ...base,
        player: hand.cards,
        pv: handValue(hand.cards).total,
        won: hand.winner === 'player',
        lost: hand.winner === 'dealer',
        doubled: Boolean(hand.doubled),
        riskyHit: Boolean(hand.riskyHit),
        needle: Boolean(hand.needle),
      }))
    : [{ ...base, player: [], pv: 0, won: false, lost: overall === 'dealer' }]
  const earned = awardBadges(next, contexts, round.at)

  return { profile: next, delta: next.rp - profile.rp, lines, earned, before, after }
}

// Milestones that depend only on the saved profile (hands played, rank, badge
// counts). Checked on load so a returning player's list is right straight away.
const PROFILE_MILESTONES = BADGES.filter(
  (b) => b.category === 'Career' || b.category === 'Rank' || ['thrill-seeker', 'collector', 'completionist'].includes(b.id),
).map((b) => b.id)

export function catchUpBadges(profile, now = Date.now()) {
  const next = { ...profile, badges: { ...profile.badges } }
  const context = { profile, after: rankOf(profile.rp), peak: rankOf(profile.peakRp) }
  const earned = awardBadges(next, [context], now, PROFILE_MILESTONES)
  return { profile: earned.length ? next : profile, earned }
}

// Pin or unpin an earned badge in the showcase (up to SHOWCASE_SIZE). The first
// pin earns Show-Off, which can in turn complete a collection badge.
export function pinBadge(profile, id, now = Date.now()) {
  const showcase = profile.showcase ?? []
  if (!profile.badges[id]) return { profile, earned: [] }
  if (!showcase.includes(id) && showcase.length >= SHOWCASE_SIZE) return { profile, earned: [] }
  const next = {
    ...profile,
    badges: { ...profile.badges },
    showcase: showcase.includes(id) ? showcase.filter((b) => b !== id) : [...showcase, id],
  }
  const earned = []
  if (!next.badges['show-off']) {
    next.badges['show-off'] = { count: 1, first: now }
    earned.push('show-off')
    // Outside a hand, only the collection badges can follow from a new badge.
    earned.push(...awardBadges(next, [{}], now, ['collector', 'completionist']))
  }
  return { profile: next, earned }
}
