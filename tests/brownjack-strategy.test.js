import test from "node:test";
import assert from "node:assert/strict";
import { bestMove, describeSpot } from "../public/projects/brownjack/js/strategy.mjs";

const c = (rank) => ({ rank, suit: "hearts" });
const hand = (...ranks) => ranks.map(c);

test("hard totals follow basic strategy", () => {
  for (const up of ["2", "6", "10", "A"]) assert.equal(bestMove(hand("5", "6"), c(up)), "hit", `11 v ${up}`);
  assert.equal(bestMove(hand("10", "2"), c("3")), "hit");
  for (const up of ["4", "5", "6"]) assert.equal(bestMove(hand("10", "2"), c(up)), "stand", `12 v ${up}`);
  assert.equal(bestMove(hand("10", "2"), c("7")), "hit");
  for (const up of ["2", "6"]) assert.equal(bestMove(hand("10", "6"), c(up)), "stand", `16 v ${up}`);
  for (const up of ["7", "10", "A"]) assert.equal(bestMove(hand("10", "6"), c(up)), "hit", `16 v ${up}`);
  for (const up of ["2", "10", "A"]) assert.equal(bestMove(hand("10", "7"), c(up)), "stand", `17 v ${up}`);
  assert.equal(bestMove(hand("10", "3", "4"), c("K")), "stand", "three-card hard 17");
});

test("soft totals follow basic strategy", () => {
  assert.equal(bestMove(hand("A", "6"), c("2")), "hit", "soft 17 always hits");
  for (const up of ["2", "7", "8"]) assert.equal(bestMove(hand("A", "7"), c(up)), "stand", `soft 18 v ${up}`);
  for (const up of ["9", "10", "A"]) assert.equal(bestMove(hand("A", "7"), c(up)), "hit", `soft 18 v ${up}`);
  assert.equal(bestMove(hand("A", "8"), c("10")), "stand", "soft 19");
  assert.equal(bestMove(hand("A", "A"), c("6")), "hit", "soft 12");
});

test("spots read naturally", () => {
  assert.equal(describeSpot(hand("10", "2"), c("K")), "hard 12 against a 10");
  assert.equal(describeSpot(hand("A", "7"), c("A")), "soft 18 against an ace");
  assert.equal(describeSpot(hand("9", "7"), c("8")), "hard 16 against an 8");
});
