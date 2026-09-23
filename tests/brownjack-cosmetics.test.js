import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { BADGES } from "../public/projects/brownjack/js/badges.mjs";
import { newProfile } from "../public/projects/brownjack/js/ranked.mjs";
import {
  CARD_BACKS, RARITY_POINTS, TABLES, TOTAL_POINTS, collectionPoints, isUnlocked, nextTable, progress, selected, unlockedIds, unlocksAt,
} from "../public/projects/brownjack/js/cosmetics.mjs";
import { TABLE_THEMES, tableSVG } from "../public/projects/brownjack/js/tableart.mjs";

const ctx = (profile = {}) => ({ profile: { ...newProfile(), ...profile } });
const item = (list, id) => list.find((i) => i.id === id);
const earned = (...ids) => Object.fromEntries(ids.map((id) => [id, { count: 1, first: 0 }]));

test("every Legendary badge has its own card back, and every back's file exists", () => {
  const legendary = BADGES.filter((b) => b.rarity === "Legendary").map((b) => b.id);
  const badgeBacks = CARD_BACKS.filter((b) => b.unlock[0] === "badge").map((b) => b.unlock[1]);
  assert.deepEqual([...badgeBacks].sort(), [...legendary].sort());
  assert.deepEqual(CARD_BACKS.filter((b) => b.unlock[0] === "tier").map((b) => b.unlock[1]), [0, 1, 2, 3, 4, 5]);
  for (const back of CARD_BACKS) {
    assert.ok(existsSync(new URL(`../public/projects/brownjack/assets/cards/${back.file}`, import.meta.url)), back.file);
  }
});

test("collection points weigh badges by rarity", () => {
  assert.equal(collectionPoints(newProfile()), 0);
  // natural (Common) + heater (Rare) + standoff (Epic) + inferno (Legendary)
  assert.equal(collectionPoints({ badges: earned("natural", "heater", "standoff", "inferno") }), 1 + 3 + 8 + 20);
  assert.equal(TOTAL_POINTS, BADGES.reduce((s, b) => s + RARITY_POINTS[b.rarity], 0));
});

test("tables unlock at rising point milestones, the last short of every badge", () => {
  const milestones = TABLES.map((t) => t.unlock[1]);
  assert.deepEqual(milestones, [...milestones].sort((a, b) => a - b));
  assert.equal(milestones[0], 0);
  assert.ok(milestones.at(-1) < TOTAL_POINTS);
  for (const table of TABLES.slice(1)) assert.ok(TABLE_THEMES[table.id], `${table.id} has a layout`);
  const p = ctx({ badges: earned("heater", "charlie", "needle", "natural") }); // 10 points
  assert.ok(isUnlocked(item(TABLES, "coffeehouse"), p));
  assert.equal(nextTable(p).id, "saloon");
  assert.equal(progress(item(TABLES, "saloon"), p).status, "10/25");
});

test("a fresh player has only the defaults; locked choices fall back to them", () => {
  assert.deepEqual(unlockedIds(ctx()), ["oak", "classic"]);
  assert.equal(selected(TABLES, "royal", ctx()).id, "oak");
  assert.equal(selected(CARD_BACKS, "inferno", ctx()).id, "classic");
  assert.equal(selected(CARD_BACKS, "inferno", ctx({ badges: earned("inferno") })).id, "inferno");
  assert.equal(unlocksAt(2), "the Gilded card back");
});

test("table layouts render as SVG at any size", () => {
  for (const id of Object.keys(TABLE_THEMES)) {
    const svg = tableSVG(id, 390, 844);
    assert.match(svg, /^<svg[^>]+viewBox="0 0 390 844"/);
    assert.match(svg, /BLACKJACK PAYS 3 TO 2/);
    assert.doesNotMatch(tableSVG(id, 120, 70, { detail: false }), /DEALER STANDS/);
  }
  assert.equal(tableSVG("oak", 100, 100), "");
});
