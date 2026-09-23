import test from "node:test";
import assert from "node:assert/strict";
import {
  BADGES,
  CATEGORIES,
  LEGEND_AT,
  LOSS_POINTS,
  WIN_POINTS,
  catchUpBadges,
  newProfile,
  pinBadge,
  rankOf,
  SHOWCASE_SIZE,
  scoreRound,
} from "../public/projects/brownjack/js/ranked.mjs";

const card = (rank, suit = "hearts") => ({ rank, suit });
const at = (rp, extra = {}) => ({ ...newProfile(), rp, ...extra });
const win = { winner: "player", player: [card("K"), card("9")], dealer: [card("10"), card("8")] };
const loss = { winner: "dealer", player: [card("K"), card("7")], dealer: [card("10"), card("9")] };

test("rank points map onto five tiers of three divisions, then Legend stars", () => {
  assert.equal(rankOf(0).name, "Bronze I");
  assert.equal(rankOf(99).name, "Bronze I");
  assert.equal(rankOf(100).name, "Bronze II");
  assert.equal(rankOf(300).name, "Silver I");
  assert.equal(rankOf(LEGEND_AT - 1).name, "Diamond III");
  assert.equal(rankOf(LEGEND_AT).name, "Legend ★0");
  assert.deepEqual(
    [rankOf(LEGEND_AT + 345).stars, rankOf(LEGEND_AT + 345).progress],
    [3, 45],
  );
});

test("climbing gets harder: wins pay less and losses cost more at every tier", () => {
  for (let i = 1; i < WIN_POINTS.length; i++) {
    assert.ok(WIN_POINTS[i] < WIN_POINTS[i - 1], `win points drop at tier ${i}`);
    assert.ok(LOSS_POINTS[i] > LOSS_POINTS[i - 1], `loss points grow at tier ${i}`);
  }
  assert.equal(scoreRound(at(50), win).delta, WIN_POINTS[0]);
  assert.equal(scoreRound(at(950), win).delta, WIN_POINTS[3]);
  assert.equal(scoreRound(at(950), loss).delta, -LOSS_POINTS[3]);
});

test("losses can demote, but rank points never go below zero", () => {
  assert.equal(scoreRound(at(3), loss).profile.rp, 0);
  const demoted = scoreRound(at(302), loss);
  assert.equal(demoted.before.name, "Silver I");
  assert.equal(demoted.after.name, "Bronze III");
  const lostStar = scoreRound(at(LEGEND_AT + 105), loss);
  assert.equal(lostStar.after.stars, 0);
});

test("bonuses reward naturals, risky hits, long hands and streaks", () => {
  const labels = (result) => result.lines.map((line) => line.label);
  const natural = scoreRound(at(0), { ...win, player: [card("A"), card("K")] });
  assert.deepEqual(labels(natural), ["Win", "Blackjack"]);
  const risky = scoreRound(at(0), { ...win, riskyHit: true });
  assert.ok(labels(risky).includes("Daredevil"));
  const charlie = scoreRound(at(0), {
    ...win,
    player: [card("2"), card("3"), card("2"), card("4"), card("5")],
  });
  assert.ok(labels(charlie).includes("Five-card Charlie"));
  assert.deepEqual(labels(scoreRound(at(0, { streak: 1 }), win)), ["Win"]);
  const third = scoreRound(at(0, { streak: 2 }), win);
  assert.deepEqual(third.lines.at(-1), { label: "3 in a row", points: 3 });
  assert.equal(scoreRound(at(0, { streak: 20 }), win).lines.at(-1).points, 15);
  assert.equal(scoreRound(at(0, { streak: 4 }), loss).profile.streak, 0);
});

test("pushes and abandoned hands", () => {
  const push = scoreRound(at(40, { streak: 3 }), { winner: "push", player: [], dealer: [] });
  assert.equal(push.delta, 0);
  assert.equal(push.profile.streak, 3);
  const forfeit = scoreRound(at(40), { winner: "dealer", forfeit: true });
  assert.equal(forfeit.lines[0].label, "Abandoned hand");
  assert.equal(forfeit.profile.rp, 40 - LOSS_POINTS[0]);
});

test("badges unlock from hands, streaks and milestones, once where they should", () => {
  const earned = (profile, round) => scoreRound(profile, round).earned;
  const unlocks = (profile, round, id) => earned(profile, round).includes(id);
  const hand = (...cards) => cards.map(([rank, suit = "hearts"]) => card(rank, suit));

  assert.ok(unlocks(at(0), { ...win, player: hand(["A", "spades"], ["J", "clubs"]) }, "original"));
  assert.ok(!unlocks(at(0), { ...win, player: hand(["A", "hearts"], ["J", "clubs"]) }, "original"));
  assert.ok(unlocks(at(0), { ...win, player: hand(["A", "hearts"], ["Q", "hearts"]) }, "suited-up"));
  assert.ok(unlocks(at(0), { ...win, player: hand(["7"], ["7", "clubs"], ["7", "spades"]) }, "sevens"));
  assert.ok(unlocks(at(0), { ...win, player: hand(["8"], ["6", "clubs"], ["7", "spades"]) }, "straight"));
  assert.ok(unlocks(at(0), { winner: "push", player: hand(["A"], ["K"]), dealer: hand(["A", "clubs"], ["Q"]) }, "standoff"));
  assert.ok(unlocks(at(0), { ...win, needle: true, riskyHit: true }, "needle"));
  assert.ok(unlocks(at(0), { ...win, riskyHit: true }, "daredevil"));
  assert.ok(unlocks(at(0), { ...win, dealer: hand(["2"], ["3"], ["2", "clubs"], ["4"], ["5"], ["K"]) }, "meltdown"));
  assert.ok(unlocks(at(0), { ...loss, player: hand(["K"], ["Q"]), dealer: hand(["2"], ["3"], ["4"], ["2", "clubs"], ["10"]) }, "bad-beat"));
  assert.ok(unlocks(at(0), { ...win, player: hand(["A"], ["A", "clubs"], ["A", "spades"], ["8"]) }, "ace-collector"));
  assert.ok(unlocks(at(0), { ...loss, player: hand(["A", "spades"], ["A", "clubs"], ["8", "spades"], ["8", "clubs"], ["K"]) }, "dead-mans-hand"));
  assert.ok(unlocks(at(0), { ...loss, player: hand(["K"], ["5"], ["7"]) }, "so-close"));
  assert.ok(unlocks(at(0, { streak: 2 }), win, "hat-trick"));
  assert.ok(unlocks(at(0, { streak: 4 }), win, "heater"));
  assert.ok(unlocks(at(0, { streak: 9 }), win, "inferno"));
  assert.ok(unlocks(at(0, { lossStreak: 4 }), loss, "cold-streak"));
  assert.ok(unlocks(at(0, { lossStreak: 6 }), win, "comeback"));
  assert.ok(unlocks(at(0, { games: 99 }), loss, "regular"));
  assert.ok(unlocks(at(0, { blackjacks: 9 }), { ...win, player: hand(["A"], ["K"]) }, "natural-talent"));
  assert.ok(unlocks(at(LEGEND_AT - 5), win, "legend"));
  assert.ok(unlocks(at(LEGEND_AT + 490), win, "constellation"));
  assert.ok(unlocks(at(0), { ...loss, at: new Date(2026, 1, 13, 20).getTime() }, "friday-13"));
  assert.ok(unlocks(at(0), { ...loss, at: new Date(2026, 8, 23, 3).getTime() }, "night-owl"));
  assert.ok(unlocks(at(0), { ...loss, sessionHands: 50 }, "marathon"));
  assert.ok(unlocks(at(0), { ...win, lastInShoe: true }, "last-call"));
  assert.ok(!unlocks(at(0), { ...loss, lastInShoe: true }, "last-call"));
  assert.ok(unlocks(at(0), { ...win, player: hand(["A"], ["K"]), firstInShoe: true }, "fresh-start"));
  assert.ok(unlocks(at(0, { textbookStreak: 9 }), { ...loss, decisions: [true, true] }, "quick-study"));
  assert.ok(unlocks(at(0, { textbookStreak: 49 }), { ...win, decisions: [true] }, "textbook"));

  // Event badges count repeats; milestones unlock once.
  const once = scoreRound(at(0), { ...win, needle: true }).profile;
  const twice = scoreRound(once, { ...win, needle: true });
  assert.ok(!twice.earned.includes("needle"));
  assert.equal(twice.profile.badges.needle.count, 2);
  assert.equal(twice.profile.badges["first-win"].count, 1);
});

test("there are about fifty badges, each fully described", () => {
  assert.ok(BADGES.length >= 48 && BADGES.length <= 60, `${BADGES.length} badges`);
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
  for (const badge of BADGES) {
    assert.ok(badge.name && badge.desc && badge.glyph, badge.id);
    assert.ok(CATEGORIES.includes(badge.category), badge.id);
    assert.ok(["Common", "Rare", "Epic", "Legendary"].includes(badge.rarity), badge.id);
  }
});

test("collection badges follow from the badges you hold", () => {
  // 24 badges, then a first win (First Blood) makes 25 and earns Collector in the same hand.
  const skip = new Set(["first-win", "collector", "completionist"]);
  const held = BADGES.filter((b) => !skip.has(b.id)).slice(0, 24);
  const badges = Object.fromEntries(held.map((b) => [b.id, { count: 1, first: 0 }]));
  const result = scoreRound(at(0, { badges }), win);
  assert.ok(result.earned.includes("first-win"));
  assert.ok(result.earned.includes("collector"));
  assert.ok(!scoreRound(at(0, { badges: Object.fromEntries(held.slice(0, 20).map((b) => [b.id, { count: 1, first: 0 }])) }), win).earned.includes("collector"));

  const everything = Object.fromEntries(
    BADGES.filter((b) => b.id !== "completionist").map((b) => [b.id, { count: 1, first: 0 }]),
  );
  assert.ok(scoreRound(at(0, { badges: everything }), loss).earned.includes("completionist"));
});

test("the showcase holds up to five earned badges and pinning one earns Show-Off", () => {
  assert.equal(SHOWCASE_SIZE, 5);
  const ids = ["natural", "twins", "heater", "flush", "charlie", "sevens"];
  const badges = Object.fromEntries(ids.map((id) => [id, { count: 1, first: 0 }]));
  let result = pinBadge(at(0, { badges }), "natural");
  assert.deepEqual(result.profile.showcase, ["natural"]);
  assert.deepEqual(result.earned, ["show-off"]);
  let profile = result.profile;
  for (const id of ids.slice(1, 5)) profile = pinBadge(profile, id).profile;
  assert.deepEqual(profile.showcase, ids.slice(0, 5));
  assert.deepEqual(pinBadge(profile, "sevens").profile.showcase, ids.slice(0, 5), "a sixth pin is refused");
  assert.deepEqual(pinBadge(profile, "twins").profile.showcase, ["natural", "heater", "flush", "charlie"], "unpin");
  assert.deepEqual(pinBadge(at(0), "inferno").profile.showcase, [], "locked badges can't be pinned");
});

test("hard rule: a stacked deck never wins or loses points, stats, streaks or badges", () => {
  const profile = at(250, { streak: 4, games: 12, wins: 7 });
  const lucky = { ...win, player: [card("A", "spades"), card("J", "clubs")], riskyHit: true, stacked: true };
  for (const round of [lucky, { ...loss, stacked: true }, { winner: "push", player: [], dealer: [], stacked: true }]) {
    const result = scoreRound(profile, round);
    assert.equal(result.delta, 0);
    assert.equal(result.unranked, true);
    assert.deepEqual(result.earned, []);
    assert.equal(result.profile, profile);
  }
});

test("rank badges follow your best-ever rank", () => {
  // Peaked in Gold, now back in Silver: the next hand still awards Heart of Gold.
  const slipped = at(350, { peakRp: 650 });
  assert.ok(scoreRound(slipped, loss).earned.includes("gold"));
  assert.ok(!scoreRound(slipped, loss).earned.includes("platinum"));
});

test("milestones a returning player already qualifies for are awarded on load", () => {
  const returning = at(640, { peakRp: 700, games: 120, wins: 55 });
  const { profile, earned } = catchUpBadges(returning);
  assert.deepEqual(earned.sort(), ["first-win", "gold", "regular", "silver"]);
  assert.equal(profile.rp, 640, "no points change");
  assert.deepEqual(catchUpBadges(profile).earned, [], "nothing twice");
  assert.equal(catchUpBadges(at(0)).profile.badges["night-owl"], undefined);
});

test("strategy stats count decisions, and only mistakes break the textbook run", () => {
  let p = scoreRound(at(0), { ...win, decisions: [true, true] }).profile;
  assert.deepEqual([p.decisions, p.goodDecisions, p.textbookStreak], [2, 2, 1]);
  p = scoreRound(p, { ...win, player: [card("A"), card("K")] }).profile; // a natural: no choice made
  assert.equal(p.textbookStreak, 1);
  p = scoreRound(p, { ...loss, decisions: [true, false] }).profile;
  assert.deepEqual([p.decisions, p.goodDecisions, p.textbookStreak, p.bestTextbookStreak], [4, 3, 0, 1]);
});
