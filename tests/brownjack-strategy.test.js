import test from "node:test";
import assert from "node:assert/strict";
import { bestMove, describeSpot } from "../public/projects/brownjack/js/strategy.mjs";

const c = (rank) => ({ rank, suit: "hearts" });
const hand = (...ranks) => ranks.map(c);
// Hit or stand only, as when doubling is no longer allowed.
const hs = { canDouble: false };

test("hard totals follow basic strategy", () => {
  for (const up of ["2", "6", "10", "A"]) assert.equal(bestMove(hand("5", "6"), c(up), hs), "hit", `11 v ${up}`);
  assert.equal(bestMove(hand("10", "2"), c("3"), hs), "hit");
  for (const up of ["4", "5", "6"]) assert.equal(bestMove(hand("10", "2"), c(up), hs), "stand", `12 v ${up}`);
  assert.equal(bestMove(hand("10", "2"), c("7"), hs), "hit");
  for (const up of ["2", "6"]) assert.equal(bestMove(hand("10", "6"), c(up), hs), "stand", `16 v ${up}`);
  for (const up of ["7", "10", "A"]) assert.equal(bestMove(hand("10", "6"), c(up), hs), "hit", `16 v ${up}`);
  for (const up of ["2", "10", "A"]) assert.equal(bestMove(hand("10", "7"), c(up), hs), "stand", `17 v ${up}`);
  assert.equal(bestMove(hand("10", "3", "4"), c("K"), hs), "stand", "three-card hard 17");
});

test("soft totals follow basic strategy", () => {
  assert.equal(bestMove(hand("A", "6"), c("2"), hs), "hit", "soft 17 always hits");
  for (const up of ["2", "7", "8"]) assert.equal(bestMove(hand("A", "7"), c(up), hs), "stand", `soft 18 v ${up}`);
  for (const up of ["9", "10", "A"]) assert.equal(bestMove(hand("A", "7"), c(up), hs), "hit", `soft 18 v ${up}`);
  assert.equal(bestMove(hand("A", "8"), c("10"), hs), "stand", "soft 19");
  assert.equal(bestMove(hand("A", "A"), c("6"), hs), "hit", "soft 12");
});

test("spots read naturally", () => {
  assert.equal(describeSpot(hand("10", "2"), c("K")), "hard 12 against a 10");
  assert.equal(describeSpot(hand("A", "7"), c("A")), "soft 18 against an ace");
  assert.equal(describeSpot(hand("9", "7"), c("8")), "hard 16 against an 8");
});

test("doubles follow basic strategy when allowed", () => {
  assert.equal(bestMove(hand("5", "6"), c("10")), "double", "11 v 10");
  assert.equal(bestMove(hand("5", "6"), c("A")), "hit", "11 v ace");
  assert.equal(bestMove(hand("6", "4"), c("9")), "double", "10 v 9");
  assert.equal(bestMove(hand("6", "4"), c("10")), "hit", "10 v 10");
  assert.equal(bestMove(hand("5", "4"), c("3")), "double", "9 v 3");
  assert.equal(bestMove(hand("5", "4"), c("2")), "hit", "9 v 2");
  assert.equal(bestMove(hand("A", "6"), c("3")), "double", "soft 17 v 3");
  assert.equal(bestMove(hand("A", "7"), c("6")), "double", "soft 18 v 6");
  assert.equal(bestMove(hand("A", "7"), c("2")), "stand", "soft 18 v 2");
  assert.equal(bestMove(hand("A", "2"), c("5")), "double", "soft 13 v 5");
  assert.equal(bestMove(hand("A", "2"), c("4")), "hit", "soft 13 v 4");
  // Three cards can't double: fall back to the right hit or stand.
  assert.equal(bestMove(hand("A", "4", "3"), c("6")), "stand", "three-card soft 18 v 6: stand, not double");
  assert.equal(bestMove(hand("4", "3", "4"), c("6")), "hit", "three-card 11 v 6: hit, not double");
});

test("splits follow basic strategy", () => {
  const split = (a, b, up) => bestMove(hand(a, b), c(up), { canSplit: true });
  assert.equal(split("A", "A", "10"), "split");
  assert.equal(split("8", "8", "A"), "split");
  assert.equal(split("10", "10", "6"), "stand");
  assert.equal(split("5", "5", "6"), "double", "5s play as hard 10");
  assert.equal(split("9", "9", "7"), "stand");
  assert.equal(split("9", "9", "8"), "split");
  assert.equal(split("7", "7", "8"), "hit");
  assert.equal(split("4", "4", "5"), "split");
  assert.equal(split("2", "2", "7"), "split");
  assert.equal(split("2", "2", "8"), "hit");
  assert.equal(bestMove(hand("8", "8"), c("A")), "hit", "can't split: plain hard 16 v ace");
  assert.equal(describeSpot(hand("8", "8"), c("6"), { pair: true }), "a pair of 8s against a 6");
});
