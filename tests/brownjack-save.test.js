import test from "node:test";
import assert from "node:assert/strict";
import { newProfile } from "../public/projects/brownjack/js/ranked.mjs";
import { checksum, exportSave, parseSave, saveFileName } from "../public/projects/brownjack/js/save.mjs";

const played = {
  ...newProfile(),
  rp: 640, peakRp: 700, games: 120, wins: 55, losses: 55, pushes: 10, streak: 2, bestStreak: 6, blackjacks: 7,
  badges: { heater: { count: 3, first: 1_700_000_000_000 }, natural: { count: 7, first: 1_700_000_000_000 } },
  showcase: ["heater"],
};
// Re-sign a tampered save the way a legitimate export would, to test the checks behind the checksum.
const resigned = (mutate) => {
  const data = JSON.parse(exportSave(played));
  mutate(data.profile);
  data.checksum = checksum(data.profile);
  return JSON.stringify(data);
};

test("a save round-trips through export and import", () => {
  const text = exportSave(played, new Date("2026-09-23T12:00:00Z"));
  const result = parseSave(text);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.profile, played);
  assert.equal(result.exportedAt, Date.parse("2026-09-23T12:00:00Z"));
  assert.equal(saveFileName(new Date("2026-09-23T12:00:00Z")), "brownjack-save-2026-09-23.json");
});

test("files that aren't BrownJack saves are rejected with a clear message", () => {
  assert.match(parseSave("").error, /empty/);
  assert.match(parseSave("not json {").error, /valid JSON/);
  assert.match(parseSave(JSON.stringify({ hello: 1 })).error, /isn't a BrownJack save/);
  assert.match(parseSave("x".repeat(200_000)).error, /too large/);
  const newer = JSON.parse(exportSave(played));
  newer.version = 99;
  assert.match(parseSave(JSON.stringify(newer)).error, /newer version/);
  const noProfile = JSON.parse(exportSave(played));
  delete noProfile.profile;
  assert.match(parseSave(JSON.stringify(noProfile)).error, /missing/);
});

test("edited or damaged saves fail the checksum", () => {
  const data = JSON.parse(exportSave(played));
  data.profile.rp = 99_999;
  assert.match(parseSave(JSON.stringify(data)).error, /modified or is damaged/);
  const junkBadge = JSON.parse(exportSave(played));
  junkBadge.profile.badges.heater = null;
  assert.match(parseSave(JSON.stringify(junkBadge)).error, /modified or is damaged/);
});

test("even a correctly signed save must make sense", () => {
  assert.match(parseSave(resigned((p) => { p.rp = -5; })).error, /invalid numbers/);
  assert.match(parseSave(resigned((p) => { p.games = 1.5; })).error, /invalid numbers/);
  assert.match(parseSave(resigned((p) => { p.peakRp = 10; })).error, /don’t add up/);
  assert.match(parseSave(resigned((p) => { p.wins = 500; })).error, /don’t add up/);
  assert.match(parseSave(resigned((p) => { p.badges.heater = { count: 0, first: 1 }; })).error, /invalid badge/);
});

test("unknown badges are dropped and the showcase is cleaned up", () => {
  const result = parseSave(resigned((p) => {
    p.badges["from-the-future"] = { count: 1, first: 1 };
    p.showcase = ["heater", "heater", "from-the-future", "inferno", "natural"];
  }));
  assert.equal(result.error, undefined);
  assert.equal(result.profile.badges["from-the-future"], undefined);
  assert.deepEqual(result.profile.showcase, ["heater", "natural"]);
});

test("saves from before a field existed still import with defaults", () => {
  const result = parseSave(resigned((p) => { delete p.lossStreak; delete p.daredevilWins; delete p.showcase; }));
  assert.equal(result.error, undefined);
  assert.equal(result.profile.lossStreak, 0);
  assert.deepEqual(result.profile.showcase, []);
});
