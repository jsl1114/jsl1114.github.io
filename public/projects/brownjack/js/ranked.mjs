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
//   { winner: 'player' | 'dealer' | 'push', player, dealer, riskyHit, needle, forfeit, stacked,
//     at, sessionHands }
// riskyHit: the player hit on a hard 17+; needle: that hit was on 18+ and landed on 21.
// at: when the hand finished (for time-based badges); sessionHands: ranked hands this sitting.
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
  const player = round.player ?? []
  const dealer = round.dealer ?? []

  next.games++
  if (isBlackjack(player)) next.blackjacks++
  if (round.winner === 'player') {
    next.wins++
    next.streak++
    next.lossStreak = 0
    if (round.riskyHit) next.daredevilWins++
    lines.push({ label: 'Win', points: WIN_POINTS[before.tierIndex] })
    if (isBlackjack(player)) lines.push({ label: 'Blackjack', points: BONUS.blackjack })
    if (round.riskyHit) lines.push({ label: 'Daredevil', points: BONUS.daredevil })
    if (player.length >= 5) lines.push({ label: 'Five-card Charlie', points: BONUS.charlie })
    const streakBonus = Math.min(BONUS.streakCap, BONUS.streakStep * (next.streak - 2))
    if (streakBonus > 0) lines.push({ label: `${next.streak} in a row`, points: streakBonus })
  } else if (round.winner === 'dealer') {
    next.losses++
    next.streak = 0
    next.lossStreak++
    lines.push({ label: round.forfeit ? 'Abandoned hand' : 'Loss', points: -LOSS_POINTS[before.tierIndex] })
  } else {
    next.pushes++
    lines.push({ label: 'Push', points: 0 })
  }

  const delta = lines.reduce((sum, line) => sum + line.points, 0)
  next.rp = Math.max(0, profile.rp + delta)
  next.peakRp = Math.max(profile.peakRp, next.rp)
  next.bestStreak = Math.max(profile.bestStreak, next.streak)

  const after = rankOf(next.rp)
  const earned = awardBadges(next, {
    won: round.winner === 'player',
    lost: round.winner === 'dealer',
    player,
    dealer,
    pv: handValue(player).total,
    dv: handValue(dealer).total,
    round,
    profile,
    after,
    peak: rankOf(next.peakRp),
  }, round.at)

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
  const earned = awardBadges(next, context, now, PROFILE_MILESTONES)
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
    earned.push(...awardBadges(next, {}, now, ['collector', 'completionist']))
  }
  return { profile: next, earned }
}
