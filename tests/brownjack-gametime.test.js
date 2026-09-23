import test from "node:test";
import assert from "node:assert/strict";
import { addDays, daysBetween, gameDate, gameMidnight } from "../public/projects/brownjack/js/gametime.mjs";

test("midnight Eastern is 04:00 UTC in summer and 05:00 UTC in winter", () => {
  assert.equal(new Date(gameMidnight(2026, 8, 24)).toISOString(), "2026-09-24T04:00:00.000Z");
  assert.equal(new Date(gameMidnight(2026, 11, 1)).toISOString(), "2026-12-01T05:00:00.000Z");
  // The changeover days themselves (clocks move at 2 am, after midnight).
  assert.equal(new Date(gameMidnight(2026, 10, 1)).toISOString(), "2026-11-01T04:00:00.000Z");
  assert.equal(new Date(gameMidnight(2027, 2, 14)).toISOString(), "2027-03-14T05:00:00.000Z");
  // Month overflow, as seasons use it.
  assert.equal(new Date(gameMidnight(2026, 12, 1)).toISOString(), "2027-01-01T05:00:00.000Z");
});

test("game dates and calendar arithmetic", () => {
  assert.equal(gameDate(gameMidnight(2026, 10, 1) - 1), "2026-10-31");
  assert.equal(gameDate(gameMidnight(2026, 10, 1)), "2026-11-01");
  assert.equal(addDays("2026-11-01", 1), "2026-11-02");
  assert.equal(addDays("2027-03-01", -1), "2027-02-28");
  assert.equal(daysBetween("2026-09-23", "2027-03-14"), 172);
});
