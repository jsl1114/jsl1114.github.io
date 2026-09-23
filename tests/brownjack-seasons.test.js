import test from "node:test";
import assert from "node:assert/strict";
import { LEGEND_AT, newProfile, rankOf, scoreRound } from "../public/projects/brownjack/js/ranked.mjs";
import { daysLeft, rollSeason, seasonId, seasonName, softReset } from "../public/projects/brownjack/js/seasons.mjs";
import { checksum, exportSave, parseSave } from "../public/projects/brownjack/js/save.mjs";

const at = (rp, extra = {}) => ({ ...newProfile(), rp, peakRp: rp, ...extra });

test("seasons are UTC months starting September 2026", () => {
  assert.equal(seasonId(Date.UTC(2026, 8, 23)), 1);
  assert.equal(seasonId(Date.UTC(2026, 9, 1)), 2);
  assert.equal(seasonId(Date.UTC(2027, 0, 15)), 5);
  assert.equal(seasonName(1), "Season 1 · Sep 2026");
  assert.equal(daysLeft(1, Date.UTC(2026, 8, 23, 12)), 8);
});

test("a new season drops everyone one tier from the start of their division", () => {
  assert.equal(rankOf(softReset(740)).name, "Silver II", "Gold II → Silver II");
  assert.equal(softReset(250), 0, "Bronze can't go below zero");
  assert.equal(rankOf(softReset(LEGEND_AT + 530)).name, "Legend ★2");
});

test("a profile that has never had a season just joins the current one", () => {
  const { profile, ended } = rollSeason(at(740, { games: 50 }), 3);
  assert.equal(ended, null);
  assert.deepEqual([profile.rp, profile.season, profile.seasonPeakRp], [740, 3, 740]);
});

test("rolling over keeps a medal, soft-resets RP and leaves all-time stats alone", () => {
  const before = at(740, { peakRp: 950, games: 60, season: 1, seasonPeakRp: 820, seasonGames: 40 });
  const { profile, ended } = rollSeason(before, 2);
  assert.deepEqual(ended, { id: 1, peakRp: 820, finalRp: 740 });
  assert.deepEqual([profile.rp, profile.season, profile.seasonPeakRp, profile.seasonGames], [400, 2, 400, 0]);
  assert.equal(profile.peakRp, 950, "all-time peak kept, so cosmetics stay unlocked");
  assert.deepEqual(profile.seasons, [ended]);
  assert.equal(rollSeason(profile, 2).profile, profile, "same season: nothing changes");
  // A season with no hands leaves no medal.
  assert.equal(rollSeason({ ...profile, seasonGames: 0 }, 3).ended, null);
});

test("hands count toward the season's peak and games", () => {
  const p = scoreRound(at(90, { season: 1, seasonPeakRp: 90, seasonGames: 3 }), { winner: "player", player: [{ rank: "K", suit: "hearts" }, { rank: "9", suit: "hearts" }], dealer: [] }).profile;
  assert.deepEqual([p.seasonGames, p.seasonPeakRp], [4, p.rp]);
});

test("season badges unlock when a season ends", () => {
  const legend = rollSeason(at(LEGEND_AT + 40, { season: 4, seasonPeakRp: LEGEND_AT + 90, seasonGames: 9, seasons: [{ id: 2, peakRp: 500, finalRp: 400 }] }), 5);
  assert.ok(legend.earned.includes("season-legend"));
  assert.ok(!legend.earned.includes("seasoned"), "two seasons played so far");
  const third = rollSeason({ ...legend.profile, seasonGames: 5 }, 6);
  assert.ok(third.earned.includes("seasoned"));
});

test("season history survives export and import, and bad entries are rejected", () => {
  const profile = at(400, { peakRp: 950, games: 60, season: 2, seasonPeakRp: 420, seasonGames: 5, seasons: [{ id: 1, peakRp: 820, finalRp: 740 }] });
  assert.deepEqual(parseSave(exportSave(profile)).profile.seasons, profile.seasons);
  const data = JSON.parse(exportSave(profile));
  data.profile.seasons[0].finalRp = 900;
  data.checksum = checksum(data.profile);
  assert.match(parseSave(JSON.stringify(data)).error, /seasons are invalid/);
});

test("seasons never roll backwards", () => {
  const later = at(740, { season: 3, seasonPeakRp: 740, seasonGames: 5 });
  const { profile, ended } = rollSeason(later, 2);
  assert.equal(profile, later);
  assert.equal(ended, null);
});
