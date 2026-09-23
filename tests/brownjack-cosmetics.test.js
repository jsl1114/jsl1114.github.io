import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CARD_BACKS, TABLES, isUnlocked, selected, unlocksAt } from "../public/projects/brownjack/js/cosmetics.mjs";

test("one table and one card back per tier, and every back's file exists", () => {
  for (const list of [TABLES, CARD_BACKS]) assert.deepEqual(list.map((i) => i.tier), [0, 1, 2, 3, 4, 5]);
  for (const back of CARD_BACKS) {
    assert.ok(existsSync(new URL(`../public/projects/brownjack/assets/cards/${back.file}`, import.meta.url)), back.file);
  }
});

test("items unlock at their tier, and a locked choice falls back to the default", () => {
  assert.ok(isUnlocked(TABLES[2], 2));
  assert.ok(!isUnlocked(TABLES[3], 2));
  assert.equal(selected(TABLES, "royal", 4).id, "royal");
  assert.equal(selected(TABLES, "aurora", 1).id, "oak");
  assert.equal(selected(CARD_BACKS, "no-such-back", 5).id, "classic");
  assert.equal(unlocksAt(2), "Royal navy table and Gilded card back");
  assert.equal(unlocksAt(0), "Oak table and Classic card back");
});
