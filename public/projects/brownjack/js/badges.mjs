// badges.mjs — every achievement, and the check that awards it.
//
// Each check gets one finished ranked hand:
//   { won, lost, player, dealer, pv, dv, round, profile, next, after, peak }
// where `profile` is before the hand, `next` after it, pv/dv are the totals, and
// `after`/`peak` are the current and best-ever rank.
// `once` badges are milestones: they unlock a single time and never count up.
// `goal` (optional) reports [current, target] so locked milestones show progress.
//
// Rarity comes from simulating basic-strategy play. Badges that depend on how
// you play, such as Daredevil or Needle Threader, are rated by how hard they are
// to pull off.
import { isBlackjack } from './blackjack.mjs'

const FACES = ['J', 'Q', 'K']
const has = (hand, rank, suit) => hand.some((c) => c.rank === rank && c.suit === suit)
const count = (hand, rank) => hand.filter((c) => c.rank === rank).length
const dealt = (hand) => hand.slice(0, 2)
// Rank badges go by your best-ever rank, so slipping back a tier never costs one.
const reached = (tierIndex) => (x) => x.peak.tierIndex >= tierIndex
const peakGoal = (rp) => (profile) => [Math.min(profile.peakRp, rp), rp]

export const CATEGORIES = ['Hands', 'Streaks', 'Career', 'Rank', 'Special']

export const BADGES = [
  // ---- Hands ----------------------------------------------------------------
  { id: 'natural', category: 'Hands', rarity: 'Common', glyph: 'BJ', name: 'Natural', desc: 'Get dealt a blackjack.',
    check: (x) => isBlackjack(x.player) },
  { id: 'face-off', category: 'Hands', rarity: 'Common', glyph: 'KQ', name: 'Face Off', desc: 'Get dealt two face cards.',
    check: (x) => dealt(x.player).length === 2 && dealt(x.player).every((c) => FACES.includes(c.rank)) },
  { id: 'twins', category: 'Hands', rarity: 'Common', glyph: '88', name: 'Twins', desc: 'Get dealt a pair.',
    check: (x) => x.player.length >= 2 && x.player[0].rank === x.player[1].rank },
  { id: 'so-close', category: 'Hands', rarity: 'Common', glyph: '22', name: 'So Close', desc: 'Bust with exactly 22.',
    check: (x) => x.pv === 22 },
  { id: 'ambushed', category: 'Hands', rarity: 'Common', glyph: '!', name: 'Ambushed', desc: 'The dealer is dealt blackjack.',
    check: (x) => isBlackjack(x.dealer) },
  { id: 'photo-finish', category: 'Hands', rarity: 'Rare', glyph: '21>20', name: 'Photo Finish', desc: "Beat the dealer's 20 with a 21.",
    check: (x) => x.won && x.pv === 21 && x.dv === 20 },
  { id: 'heartbreaker', category: 'Hands', rarity: 'Rare', glyph: '♥', name: 'Heartbreaker', desc: "Lose a 20 to the dealer's 21.",
    check: (x) => x.lost && x.pv === 20 && x.dv === 21 },
  { id: 'suited-up', category: 'Hands', rarity: 'Rare', glyph: 'A♦', name: 'Suited Up', desc: 'Blackjack with an ace and a ten-card of the same suit.',
    check: (x) => isBlackjack(x.player) && x.player[0].suit === x.player[1].suit },
  { id: 'hard-way', category: 'Hands', rarity: 'Rare', glyph: '4→21', name: 'The Hard Way', desc: 'Make 21 with four or more cards.',
    check: (x) => x.pv === 21 && x.player.length >= 4 },
  { id: 'low-roller', category: 'Hands', rarity: 'Rare', glyph: '≤12', name: 'Low Roller', desc: 'Win standing on 12 or less.',
    check: (x) => x.won && x.pv <= 12 },
  { id: 'flush', category: 'Hands', rarity: 'Rare', glyph: '♣♣♣', name: 'Flush', desc: 'Win holding three or more cards of one suit.',
    check: (x) => x.won && x.player.length >= 3 && x.player.every((c) => c.suit === x.player[0].suit) },
  { id: 'charlie', category: 'Hands', rarity: 'Rare', glyph: '5♣', name: 'Five-Card Charlie', desc: 'Win holding five or more cards.',
    check: (x) => x.won && x.player.length >= 5 },
  { id: 'needle', category: 'Hands', rarity: 'Rare', glyph: '⌖', name: 'Needle Threader', desc: 'Hit on a hard 18 or more and land exactly 21.',
    check: (x) => Boolean(x.round.needle) },
  { id: 'snake-eyes', category: 'Hands', rarity: 'Rare', glyph: 'AA', name: 'Snake Eyes', desc: 'Get dealt two aces.',
    check: (x) => dealt(x.player).length === 2 && dealt(x.player).every((c) => c.rank === 'A') },
  { id: 'royal-couple', category: 'Hands', rarity: 'Rare', glyph: '♛♚', name: 'Royal Couple', desc: 'Get dealt the king and queen of the same suit.',
    check: (x) => {
      const [a, b] = dealt(x.player)
      return Boolean(a && b) && a.suit === b.suit && [a.rank, b.rank].sort().join() === 'K,Q'
    } },
  { id: 'straight', category: 'Hands', rarity: 'Epic', glyph: '678', name: 'Straight 21', desc: 'Make 21 with a six, a seven and an eight.',
    check: (x) => x.player.length === 3 && x.player.map((c) => c.rank).sort().join() === '6,7,8' },
  { id: 'ace-collector', category: 'Hands', rarity: 'Epic', glyph: 'AAA', name: 'Ace Collector', desc: 'Hold three aces in one hand.',
    check: (x) => count(x.player, 'A') >= 3 },
  { id: 'six-charlie', category: 'Hands', rarity: 'Epic', glyph: '6♣', name: 'Six-Card Charlie', desc: 'Win holding six or more cards.',
    check: (x) => x.won && x.player.length >= 6 },
  { id: 'bad-beat', category: 'Hands', rarity: 'Epic', glyph: '20<21', name: 'Bad Beat', desc: 'Lose a 20 to a dealer 21 made with five or more cards.',
    check: (x) => x.lost && x.pv === 20 && x.dv === 21 && x.dealer.length >= 5 },
  { id: 'standoff', category: 'Hands', rarity: 'Epic', glyph: '21²', name: 'Standoff', desc: 'You and the dealer are both dealt blackjack.',
    check: (x) => isBlackjack(x.player) && isBlackjack(x.dealer) },
  { id: 'meltdown', category: 'Hands', rarity: 'Epic', glyph: '✸', name: 'Meltdown', desc: 'The dealer busts holding six or more cards.',
    check: (x) => x.dealer.length >= 6 && x.dv > 21 },
  { id: 'original', category: 'Hands', rarity: 'Epic', glyph: 'A♠', name: 'The Original', desc: 'Blackjack with the ace of spades and a black jack.',
    check: (x) => isBlackjack(x.player) && has(x.player, 'A', 'spades') && (has(x.player, 'J', 'spades') || has(x.player, 'J', 'clubs')) },
  { id: 'sevens', category: 'Hands', rarity: 'Legendary', glyph: '777', name: 'Lucky Sevens', desc: 'Make 21 with three sevens.',
    check: (x) => x.player.length === 3 && count(x.player, '7') === 3 },
  { id: 'seven-charlie', category: 'Hands', rarity: 'Legendary', glyph: '7♣', name: 'Seven-Card Charlie', desc: 'Win holding seven or more cards.',
    check: (x) => x.won && x.player.length >= 7 },
  { id: 'dead-mans-hand', category: 'Hands', rarity: 'Legendary', glyph: 'A8', name: "Dead Man's Hand", desc: 'Hold two aces and two eights in one hand.',
    check: (x) => count(x.player, 'A') >= 2 && count(x.player, '8') >= 2 },

  // ---- Streaks --------------------------------------------------------------
  { id: 'hat-trick', category: 'Streaks', rarity: 'Common', glyph: '3×', name: 'Hat Trick', desc: 'Win three hands in a row.',
    check: (x) => x.won && x.next.streak === 3 },
  { id: 'heater', category: 'Streaks', rarity: 'Rare', glyph: '5×', name: 'Heater', desc: 'Win five hands in a row.',
    check: (x) => x.won && x.next.streak === 5 },
  { id: 'inferno', category: 'Streaks', rarity: 'Legendary', glyph: '10×', name: 'Inferno', desc: 'Win ten hands in a row.',
    check: (x) => x.won && x.next.streak === 10 },
  { id: 'cold-streak', category: 'Streaks', rarity: 'Rare', glyph: '❄', name: 'Cold Streak', desc: 'Lose five hands in a row.',
    check: (x) => x.lost && x.next.lossStreak === 5 },
  { id: 'comeback', category: 'Streaks', rarity: 'Rare', glyph: '↺', name: 'Comeback Kid', desc: 'Win right after losing five or more in a row.',
    check: (x) => x.won && x.profile.lossStreak >= 5 },
  { id: 'rock-bottom', category: 'Streaks', rarity: 'Epic', glyph: '10↓', name: 'Rock Bottom', desc: 'Lose ten hands in a row.',
    check: (x) => x.lost && x.next.lossStreak === 10 },
  { id: 'daredevil', category: 'Streaks', rarity: 'Rare', glyph: '17+', name: 'Daredevil', desc: 'Win after hitting on a hard 17 or more.',
    check: (x) => x.won && Boolean(x.round.riskyHit) },
  { id: 'thrill-seeker', category: 'Streaks', rarity: 'Epic', glyph: '⚡', name: 'Thrill Seeker', desc: 'Win ten Daredevil hands.', once: true,
    check: (x) => x.next.daredevilWins >= 10, goal: (p) => [Math.min(p.daredevilWins, 10), 10] },

  // ---- Career ---------------------------------------------------------------
  { id: 'first-win', category: 'Career', rarity: 'Common', glyph: '1', name: 'First Blood', desc: 'Win your first ranked hand.', once: true,
    check: (x) => x.next.wins >= 1 },
  { id: 'regular', category: 'Career', rarity: 'Common', glyph: '100', name: 'Regular', desc: 'Play 100 ranked hands.', once: true,
    check: (x) => x.next.games >= 100, goal: (p) => [Math.min(p.games, 100), 100] },
  { id: 'veteran', category: 'Career', rarity: 'Rare', glyph: '500', name: 'Veteran', desc: 'Play 500 ranked hands.', once: true,
    check: (x) => x.next.games >= 500, goal: (p) => [Math.min(p.games, 500), 500] },
  { id: 'lifer', category: 'Career', rarity: 'Epic', glyph: '1K', name: 'Lifer', desc: 'Play 1,000 ranked hands.', once: true,
    check: (x) => x.next.games >= 1000, goal: (p) => [Math.min(p.games, 1000), 1000] },
  { id: 'centurion', category: 'Career', rarity: 'Rare', glyph: 'C', name: 'Centurion', desc: 'Win 100 ranked hands.', once: true,
    check: (x) => x.next.wins >= 100, goal: (p) => [Math.min(p.wins, 100), 100] },
  { id: 'natural-talent', category: 'Career', rarity: 'Rare', glyph: 'BJ×10', name: 'Natural Talent', desc: 'Get dealt ten blackjacks.', once: true,
    check: (x) => x.next.blackjacks >= 10, goal: (p) => [Math.min(p.blackjacks, 10), 10] },
  { id: 'royalty', category: 'Career', rarity: 'Epic', glyph: '♔', name: 'Blackjack Royalty', desc: 'Get dealt fifty blackjacks.', once: true,
    check: (x) => x.next.blackjacks >= 50, goal: (p) => [Math.min(p.blackjacks, 50), 50] },

  // ---- Rank -----------------------------------------------------------------
  { id: 'silver', category: 'Rank', rarity: 'Common', glyph: 'Ag', name: 'Silver Lining', desc: 'Reach Silver.', once: true,
    check: reached(1), goal: peakGoal(300) },
  { id: 'gold', category: 'Rank', rarity: 'Rare', glyph: 'Au', name: 'Heart of Gold', desc: 'Reach Gold.', once: true,
    check: reached(2), goal: peakGoal(600) },
  { id: 'platinum', category: 'Rank', rarity: 'Rare', glyph: 'Pt', name: 'Platinum Club', desc: 'Reach Platinum.', once: true,
    check: reached(3), goal: peakGoal(900) },
  { id: 'diamond', category: 'Rank', rarity: 'Epic', glyph: '◆', name: 'Diamond Mind', desc: 'Reach Diamond.', once: true,
    check: reached(4), goal: peakGoal(1200) },
  { id: 'legend', category: 'Rank', rarity: 'Legendary', glyph: '★', name: 'Legend', desc: 'Reach Legend rank.', once: true,
    check: reached(5), goal: peakGoal(1500) },
  { id: 'constellation', category: 'Rank', rarity: 'Legendary', glyph: '★5', name: 'Constellation', desc: 'Reach Legend ★5.', once: true,
    check: (x) => x.peak.tierIndex === 5 && x.peak.stars >= 5, goal: peakGoal(2000) },

  // ---- Special --------------------------------------------------------------
  { id: 'night-owl', category: 'Special', rarity: 'Rare', glyph: '☾', name: 'Night Owl', desc: 'Play a ranked hand between 2 and 5 a.m.', once: true,
    check: (x) => {
      const hour = new Date(x.round.at ?? Date.now()).getHours()
      return hour >= 2 && hour < 5
    } },
  { id: 'friday-13', category: 'Special', rarity: 'Epic', glyph: '13', name: 'Friday the 13th', desc: 'Play a ranked hand on a Friday the 13th.', once: true,
    check: (x) => {
      const day = new Date(x.round.at ?? Date.now())
      return day.getDay() === 5 && day.getDate() === 13
    } },
  { id: 'last-call', category: 'Special', rarity: 'Rare', glyph: '✂', name: 'Last Call', desc: 'Win the last hand before the shoe is reshuffled.',
    check: (x) => x.won && Boolean(x.round.lastInShoe) },
  { id: 'fresh-start', category: 'Special', rarity: 'Epic', glyph: 'new', name: 'Fresh Start', desc: 'Get a blackjack on the first hand of a new shoe.',
    check: (x) => isBlackjack(x.player) && Boolean(x.round.firstInShoe) },
  { id: 'marathon', category: 'Special', rarity: 'Rare', glyph: '50', name: 'Marathon', desc: 'Play 50 ranked hands in one sitting.', once: true,
    check: (x) => (x.round.sessionHands ?? 0) >= 50 },
  { id: 'show-off', category: 'Special', rarity: 'Common', glyph: '☆', name: 'Show-Off', desc: 'Put a badge in your showcase.', once: true },
  // The two collection badges are checked last, after everything above.
  { id: 'collector', category: 'Special', rarity: 'Epic', glyph: '25', name: 'Collector', desc: 'Earn 25 different badges.', once: true,
    check: (x) => Object.keys(x.next.badges).length >= 25,
    goal: (p) => [Math.min(Object.keys(p.badges).length, 25), 25] },
  { id: 'completionist', category: 'Special', rarity: 'Legendary', glyph: '∞', name: 'Completionist', desc: 'Earn every other badge.', once: true,
    check: (x) => BADGES.every((b) => b.id === 'completionist' || x.next.badges[b.id]),
    goal: (p) => [Object.keys(p.badges).filter((id) => id !== 'completionist').length, BADGES.length - 1] },
]

export const badgeById = (id) => BADGES.find((badge) => badge.id === id)

// Award every badge whose check passes (or only those in `ids`). Mutates
// next.badges and returns the ids unlocked for the first time.
export function awardBadges(next, context, now = Date.now(), ids = null) {
  const earned = []
  for (const badge of BADGES) {
    if (!badge.check || (ids && !ids.includes(badge.id))) continue
    const current = next.badges[badge.id]
    if (current && badge.once) continue
    if (!badge.check({ ...context, next })) continue
    next.badges[badge.id] = { count: (current?.count ?? 0) + 1, first: current?.first ?? now }
    if (!current) earned.push(badge.id)
  }
  return earned
}
