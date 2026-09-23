import test from "node:test";
import assert from "node:assert/strict";
import {
  DAILY_HANDS, cleanDay, dailyKey, dailyNumber, dailyShoe, dailyStreak, formatScore, roundScore, seededRandom, shareText, totalScore,
} from "../public/projects/brownjack/js/daily.mjs";

const key = (card) => `${card.rank}-${card.suit}`;

test("every player gets the same shoe on the same day, and a new one tomorrow", () => {
  const a = dailyShoe("2026-09-24").cards.map(key);
  const b = dailyShoe("2026-09-24").cards.map(key);
  const c = dailyShoe("2026-09-25").cards.map(key);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(a.length, 312);
  assert.equal(new Set(a).size, 52);
});

test("the seeded random source is uniform enough to shuffle with", () => {
  const random = seededRandom("check");
  const buckets = new Array(10).fill(0);
  for (let i = 0; i < 100_000; i++) buckets[Math.floor(random() * 10)]++;
  for (const n of buckets) assert.ok(Math.abs(n - 10_000) < 500, `bucket ${n}`);
});

test("days are numbered on UTC", () => {
  assert.equal(dailyKey(Date.UTC(2026, 8, 24, 23, 59)), "2026-09-24");
  assert.equal(dailyKey(Date.UTC(2026, 8, 25, 0, 1)), "2026-09-25");
  assert.equal(dailyNumber("2026-09-23"), 1);
  assert.equal(dailyNumber("2026-10-23"), 31);
});

test("rounds score wins, losses, doubles, naturals and splits", () => {
  assert.equal(roundScore([{ winner: "player" }]), 1);
  assert.equal(roundScore([{ winner: "player", natural: true }]), 1.5);
  assert.equal(roundScore([{ winner: "dealer", doubled: true }]), -2);
  assert.equal(roundScore([{ winner: "player", doubled: true }, { winner: "dealer" }]), 1);
  assert.equal(roundScore([{ winner: "push" }]), 0);
  assert.equal(formatScore(2.5), "+2.5");
  assert.equal(formatScore(-1), "−1");
});

test("the share text reads like a daily puzzle result", () => {
  const rounds = [
    { hands: [{ winner: "player", natural: true }], score: 1.5 },
    { hands: [{ winner: "dealer" }], score: -1 },
    { hands: [{ winner: "player" }], score: 1 },
    { hands: [{ winner: "player", doubled: true }], score: 2 },
    { hands: [{ winner: "push" }], score: 0 },
  ];
  assert.equal(totalScore(rounds), 3.5);
  assert.equal(shareText("2026-09-23", rounds), "BrownJack Daily #1 · +3.5\n⭐🟥🟩🟩🟨");
});

test("the streak counts consecutive finished days", () => {
  const full = { rounds: new Array(DAILY_HANDS).fill({ hands: [], score: 0 }), drawn: 30 };
  const history = { "2026-09-22": full, "2026-09-23": full, "2026-09-24": { rounds: [full.rounds[0]], drawn: 4 } };
  assert.equal(dailyStreak(history, "2026-09-24"), 2, "today unfinished: count up to yesterday");
  assert.equal(dailyStreak({ ...history, "2026-09-24": full }, "2026-09-24"), 3);
  assert.equal(dailyStreak(history, "2026-09-26"), 0, "a missed day breaks it");
});

test("damaged saved days are dropped or trimmed", () => {
  assert.equal(cleanDay(null), null);
  assert.equal(cleanDay({ rounds: "x", drawn: 1 }), null);
  const trimmed = cleanDay({ rounds: [...new Array(9).fill({ hands: [], score: 1 }), { junk: true }], drawn: 40 });
  assert.equal(trimmed.rounds.length, DAILY_HANDS);
});
