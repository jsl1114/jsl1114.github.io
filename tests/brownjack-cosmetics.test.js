import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { newProfile } from "../public/projects/brownjack/js/ranked.mjs";
import { CARD_BACKS, TABLES, isUnlocked, progress, selected, unlockedIds, unlocksAt } from "../public/projects/brownjack/js/cosmetics.mjs";
import { DAILY_HANDS, dailyRecord } from "../public/projects/brownjack/js/daily.mjs";

const ctx = (profile = {}, daily = {}) => ({ profile: { ...newProfile(), ...profile }, daily: { bestStreak: 0, completed: 0, ...daily } });
const item = (list, id) => list.find((i) => i.id === id);

test("twelve tables and twelve backs, half by rank, and every back's file exists", () => {
  for (const list of [TABLES, CARD_BACKS]) {
    assert.equal(list.length, 12);
    assert.equal(new Set(list.map((i) => i.id)).size, 12);
    assert.deepEqual(list.filter((i) => i.unlock[0] === "tier").map((i) => i.unlock[1]), [0, 1, 2, 3, 4, 5]);
  }
  for (const back of CARD_BACKS) {
    assert.ok(existsSync(new URL(`../public/projects/brownjack/assets/cards/${back.file}`, import.meta.url)), back.file);
  }
});

test("a fresh player has only the defaults", () => {
  assert.deepEqual(unlockedIds(ctx()), ["oak", "classic"]);
});

test("rank items follow the best-ever tier", () => {
  assert.ok(isUnlocked(item(TABLES, "maple"), ctx({ rp: 0, peakRp: 650 })));
  assert.ok(!isUnlocked(item(TABLES, "cherry"), ctx({ peakRp: 650 })));
  assert.equal(unlocksAt(2), "Maple table and Gilded card back");
});

test("achievement items unlock from what the player does, with progress", () => {
  const legendary = item(CARD_BACKS, "legendary");
  const two = ctx({ badges: { inferno: { count: 1, first: 0 }, sevens: { count: 1, first: 0 }, heater: { count: 1, first: 0 } } });
  assert.deepEqual(progress(legendary, two), { unlocked: false, current: 2, target: 3, text: "Earn 3 Legendary badges", status: "2/3" });
  const three = ctx({ badges: { ...two.profile.badges, legend: { count: 1, first: 0 } } });
  assert.ok(isUnlocked(legendary, three));
  assert.ok(isUnlocked(item(TABLES, "mustard"), three));
  assert.ok(isUnlocked(item(CARD_BACKS, "lucky7"), three), "has the Lucky Sevens badge");

  assert.ok(isUnlocked(item(TABLES, "caramel"), ctx({ wins: 100 })));
  assert.ok(isUnlocked(item(CARD_BACKS, "midas"), ctx({ blackjacks: 50 })));
  assert.ok(isUnlocked(item(TABLES, "espresso"), ctx({}, { bestStreak: 7 })));
  assert.ok(isUnlocked(item(CARD_BACKS, "sunrise"), ctx({}, { completed: 10 })));
  assert.ok(isUnlocked(item(TABLES, "toffee"), ctx({ seasons: [{ id: 1, peakRp: 700, finalRp: 640 }] })));
  assert.ok(!isUnlocked(item(TABLES, "toffee"), ctx({ seasons: [{ id: 1, peakRp: 700, finalRp: 540 }] })), "finished in Silver");
});

test("strategy accuracy only counts after enough decisions", () => {
  const shark = item(CARD_BACKS, "shark");
  assert.ok(!isUnlocked(shark, ctx({ decisions: 100, goodDecisions: 100 })));
  assert.ok(isUnlocked(shark, ctx({ decisions: 300, goodDecisions: 270 })));
  assert.ok(!isUnlocked(shark, ctx({ decisions: 400, goodDecisions: 350 })), "87%");
});

test("a locked choice falls back to the default", () => {
  assert.equal(selected(TABLES, "mustard", ctx()).id, "oak");
  assert.equal(selected(CARD_BACKS, "no-such-back", ctx()).id, "classic");
});

test("the daily record finds the longest run of finished days", () => {
  const done = { rounds: new Array(DAILY_HANDS).fill({ hands: [], score: 0 }), drawn: 20 };
  const history = { "2026-09-01": done, "2026-09-02": done, "2026-09-03": done, "2026-09-05": done, "2026-09-06": { rounds: [], drawn: 0 } };
  assert.deepEqual(dailyRecord(history), { bestStreak: 3, completed: 4 });
});

test("progress lines only count where a count means something", () => {
  assert.equal(progress(item(TABLES, "toffee"), ctx()).status, "");
  assert.equal(progress(item(CARD_BACKS, "shark"), ctx({ decisions: 120, goodDecisions: 110 })).status, "120/300 decisions");
  assert.equal(progress(item(CARD_BACKS, "shark"), ctx({ decisions: 400, goodDecisions: 348 })).status, "now 87%");
  assert.equal(progress(item(TABLES, "chocolate"), ctx({ badges: { a: {}, b: {} } })).status, "2/30");
});
