import test from "node:test";
import assert from "node:assert/strict";
import { canSplit, createShoe, dealerShouldHit, handValue, isBlackjack, needsShuffle, outcome } from "../public/projects/brownjack/js/blackjack.mjs";
import { bestMove } from "../public/projects/brownjack/js/strategy.mjs";
import {
  FEATURE_ODDS, GRADES, HAND_BADGES, cardChance, featureName, gradeOf, handFeatures, isHallOfFame, isNotable, oneIn, rateHand,
} from "../public/projects/brownjack/js/handodds.mjs";
import { HALL_SIZE, addToHall, hallOf, rankHall } from "../public/projects/brownjack/js/halloffame.mjs";

const suits = ["hearts", "clubs", "spades", "diamonds"];
const cards = (...ranks) => ranks.map((rank, i) => ({ rank, suit: suits[i % 4] }));
const one = (winner, player, dealer, extra = {}) => ({ hands: [{ cards: cards(...player), winner, ...extra }], dealer: cards(...dealer) });

test("a hand is as rare as the rarest thing it did", () => {
  const acesHigh = {
    hands: [{ cards: cards("A", "K"), winner: "player" }, { cards: [{ rank: "A", suit: "clubs" }, { rank: "Q", suit: "hearts" }], winner: "player" }],
    dealer: cards("10", "9"),
  };
  assert.deepEqual(rateHand(acesHigh).reason, "aces-high");
  assert.equal(rateHand(acesHigh).grade, "SSS", "the rarest hands grade SSS");
  assert.ok(handFeatures(acesHigh).includes("split-decision"), "every badge it qualifies for counts, not just the rarest");

  assert.equal(rateHand(one("player", ["K", "9"], ["10", "7"])).grade, "D", "a plain win");
  assert.equal(rateHand(one("dealer", ["K", "7"], ["10", "9"])).grade, "D", "a plain loss");
  assert.equal(rateHand(one("player", ["A", "K"], ["10", "7"])).reason, "natural");
  assert.equal(rateHand(one("player", ["A", "K"], ["10", "7"])).grade, "C", "a blackjack");
  assert.equal(rateHand(one("push", ["A", "K"], ["A", "Q"])).reason, "standoff");
  assert.equal(rateHand(one("player", ["7", "7", "7"], ["10", "8"])).grade, "SSS");
  // Hail Mary is a flag from the hit that made it.
  assert.equal(rateHand(one("player", ["10", "10", "A"], ["10", "8"], { riskyHit: true, needle: true, hailMary: true })).reason, "hail-mary");
});

test("a rare bad hand rates as highly as a rare good one, and is brutal", () => {
  const disaster = {
    hands: [
      { cards: cards("8", "3", "5"), winner: "dealer", doubled: true },
      { cards: [{ rank: "8", suit: "clubs" }, { rank: "2", suit: "hearts" }, { rank: "7", suit: "spades" }], winner: "dealer", doubled: true },
    ],
    dealer: cards("6", "10", "4"),
  };
  assert.equal(rateHand(disaster).reason, "double-disaster");
  assert.equal(rateHand(disaster).grade, "SSS");
  assert.equal(rateHand(disaster).brutal, true);
  const longCon = one("dealer", ["10", "8"], ["2", "3", "4", "2", "5", "5"]);
  assert.equal(rateHand(longCon).reason, "long-con");
  assert.equal(rateHand(longCon).brutal, true);
  assert.equal(rateHand(one("dealer", ["10", "6", "2", "3", "K"], ["10", "8"])).reason, "overloaded");
  // A plain loss is common, not brutal; a good rare hand isn't brutal either.
  assert.equal(rateHand(one("dealer", ["K", "7"], ["10", "9"])).brutal, false);
  assert.equal(rateHand(one("player", ["7", "7", "7"], ["10", "8"])).brutal, false);
});

test("the more exciting the hand, the better its grade", () => {
  const rank = (grade) => GRADES.findIndex((g) => g.grade === grade);
  // Worse to better, down the list of grades.
  assert.deepEqual(GRADES.map((g) => g.grade), ["SSS", "SS", "S", "A", "B", "C", "D"]);
  const tiers = { Common: [], Rare: [], Epic: [], Legendary: [] };
  for (const badge of HAND_BADGES) tiers[badge.rarity].push(rank(gradeOf(FEATURE_ODDS[badge.id])));
  for (const grades of tiers.Legendary) assert.ok(grades <= rank("SS"), "Legendary hands grade SS or SSS");
  for (const grades of tiers.Epic) assert.ok(grades <= rank("S"), "Epic hands grade S or better");
  for (const grades of tiers.Common) assert.ok(grades >= rank("C"), "Common hands grade C or D");
  // A win beats nothing: plain results are the commonest things a hand does.
  for (const id of ["loss", "win", "push"]) assert.equal(gradeOf(FEATURE_ODDS[id]), "D", id);
});

test("only grades of A and above are shown after a hand", () => {
  assert.deepEqual(["SSS", "SS", "S", "A", "B", "C", "D", null].map(isNotable), [true, true, true, true, false, false, false, false]);
});

test("every hand badge and result has odds and a name", () => {
  for (const id of ["loss", "push", "win", "win-21", ...HAND_BADGES.map((b) => b.id)]) {
    assert.ok(FEATURE_ODDS[id] > 0 && FEATURE_ODDS[id] < 1, id);
    assert.ok(featureName(id) && featureName(id) !== id, id);
  }
  assert.equal(oneIn(1 / 1910), "1 in 1.91K");
  assert.equal(oneIn(1 / 21.1), "1 in 21");
});

// The table was measured this way, over 20 million hands; a shorter seeded run
// should agree on the common entries.
function simulate(hands, seed = 11) {
  let state = seed;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  let shoe = createShoe(6, random);
  const hits = {};
  for (let n = 0; n < hands; n++) {
    if (needsShuffle(shoe)) shoe = createShoe(6, random);
    const draw = () => shoe.cards.pop();
    const p = [draw()];
    const d = [draw()];
    p.push(draw());
    d.push(draw());
    let played = [{ cards: p }];
    if (!isBlackjack(d) && !isBlackjack(p)) {
      if (canSplit(p) && bestMove(p, d[0], { canSplit: true }) === "split") played = [{ cards: [p[0], draw()] }, { cards: [p[1], draw()] }];
      for (const h of played) {
        if (played.length > 1 && h.cards[0].rank === "A") continue;
        for (;;) {
          const move = bestMove(h.cards, d[0], { canDouble: h.cards.length === 2 });
          if (move === "stand") break;
          h.cards.push(draw());
          if (move === "double") {
            h.doubled = true;
            break;
          }
          if (handValue(h.cards).total >= 21) break;
        }
      }
      if (played.some((h) => handValue(h.cards).total <= 21)) while (dealerShouldHit(d)) d.push(draw());
    }
    for (const h of played) h.winner = outcome(h.cards, d, { split: played.length > 1 });
    for (const id of new Set(handFeatures({ hands: played, dealer: d }))) hits[id] = (hits[id] ?? 0) + 1;
  }
  return (id) => (hits[id] ?? 0) / hands;
}

test("the odds table matches basic-strategy play", () => {
  const measured = simulate(150_000);
  for (const id of ["loss", "win", "push", "win-21", "natural", "twins", "face-off", "doubled-up", "photo-finish", "flush"]) {
    const ratio = measured(id) / FEATURE_ODDS[id];
    assert.ok(ratio > 0.9 && ratio < 1.1, `${id}: measured 1 in ${Math.round(1 / measured(id))}, table 1 in ${Math.round(1 / FEATURE_ODDS[id])}`);
  }
});

test("the exact cards break ties between hands that did the same thing", () => {
  assert.ok(Math.abs(cardChance(cards("A"), cards("K")) - (24 / 312) * (24 / 311)) < 1e-12);
  assert.ok(Math.abs(cardChance(cards("A"), cards("A")) - (24 / 312) * (23 / 311)) < 1e-12);
  assert.equal(cardChance(cards("K", "9"), cards("6", "10")), cardChance(cards("9", "K"), cards("10", "6")));
  assert.ok(cardChance(cards("2", "2", "2", "2", "3", "3", "3"), cards("4", "4", "4", "5")) > 0);
});

test("the Hall of Fame keeps the ten rarest S-and-above hands of all time", () => {
  const entry = (i, record) => ({ at: 1_000 + i, ...record, ...rateHand(record) });
  const standoff = (i) => entry(i, one("push", ["A", "K"], ["A", "Q"]));
  assert.ok(isHallOfFame(standoff(0).grade));
  assert.equal(addToHall([], entry(0, one("player", ["A", "K"], ["10", "7"]))).place, null, "a blackjack (C) doesn't qualify");

  let hall = [];
  for (let i = 0; i < 12; i++) hall = addToHall(hall, standoff(i)).hall;
  assert.equal(hall.length, HALL_SIZE);
  const sevens = addToHall(hall, entry(99, one("player", ["7", "7", "7"], ["10", "8"])));
  assert.equal(sevens.place, 1, "rarer than every Standoff");
  assert.equal(sevens.hall.length, HALL_SIZE);
  assert.equal(sevens.hall[0].reason, "sevens");

  // Brutal hands go to the Hall of Shame, with their own ten places.
  const aceslow = entry(50, {
    hands: [{ cards: cards("A", "5"), winner: "dealer" }, { cards: [{ rank: "A", suit: "clubs" }, { rank: "6", suit: "hearts" }], winner: "dealer" }],
    dealer: cards("10", "9"),
  });
  const shamed = addToHall(sevens.hall, aceslow);
  assert.equal(shamed.place, 1, "first in the Hall of Shame");
  assert.equal(hallOf(shamed.hall, "fame").length, HALL_SIZE, "the Hall of Fame is untouched");
  assert.deepEqual(hallOf(shamed.hall, "shame").map((e) => e.reason), ["aces-low"]);

  // Old entries are rated again when read, and anything unrated is dropped.
  const stale = [{ ...standoff(5), chance: 0.5, grade: "D" }, { ...entry(6, one("player", ["K", "9"], ["10", "7"])) }];
  assert.deepEqual(rankHall(stale).map((e) => e.reason), ["standoff"]);
});
