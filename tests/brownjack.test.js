import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDeck,
  createDeck,
  createShoe,
  needsShuffle,
  dealerShouldHit,
  handValue,
  isBlackjack,
  outcome,
  shuffle,
} from "../public/projects/brownjack/js/blackjack.mjs";

const hand = (...ranks) => ranks.map((rank, i) => ({ rank, suit: ["spades", "hearts", "clubs", "diamonds"][i % 4] }));
const key = (card) => `${card.rank}-${card.suit}`;

test("a deck has 52 unique cards", () => {
  assert.equal(new Set(createDeck().map(key)).size, 52);
});

test("shuffle is an unbiased permutation", () => {
  const deck = createDeck();
  assert.deepEqual(shuffle(deck).map(key).sort(), deck.map(key).sort());

  // Every ordering of three cards should come up about equally often.
  const runs = 60000;
  const counts = new Map();
  for (let i = 0; i < runs; i++) {
    const order = shuffle(["a", "b", "c"]).join("");
    counts.set(order, (counts.get(order) ?? 0) + 1);
  }
  assert.equal(counts.size, 6);
  for (const count of counts.values()) {
    assert.ok(Math.abs(count - runs / 6) < runs / 6 * 0.05, `ordering count ${count}`);
  }
});

test("stacked cards go on top in order without duplicating anything", () => {
  const stacked = [{ rank: "A", suit: "spades" }, { rank: "K", suit: "hearts" }];
  const deck = buildDeck(stacked);
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map(key)).size, 52);
  assert.deepEqual(deck.at(-1), stacked[0]);
  assert.deepEqual(deck.at(-2), stacked[1]);
});

test("hand values treat aces as 1 or 11", () => {
  assert.deepEqual(handValue(hand("A", "K")), { total: 21, soft: true });
  assert.equal(handValue(hand("A", "A", "9")).total, 21);
  assert.equal(handValue(hand("A", "6", "A", "5")).total, 13);
  assert.equal(handValue(hand("K", "Q", "A")).total, 21);
  assert.equal(handValue(hand("9", "2", "A")).total, 12);
  assert.equal(handValue(hand("A", "A", "A", "A")).total, 14);
});

test("the dealer hits below 17 and stands on every 17, regardless of the player", () => {
  assert.equal(dealerShouldHit(hand("10", "6")), true);
  assert.equal(dealerShouldHit(hand("10", "7")), false);
  assert.equal(dealerShouldHit(hand("A", "6")), false);
  assert.equal(dealerShouldHit(hand("K", "2", "A")), true);
});

test("outcomes follow blackjack rules", () => {
  assert.equal(outcome(hand("K", "Q", "5"), hand("K", "Q", "5")), "dealer"); // player busts first
  assert.equal(outcome(hand("K", "7"), hand("K", "6", "9")), "player");
  assert.equal(outcome(hand("A", "K"), hand("7", "7", "7")), "player"); // natural beats three-card 21
  assert.equal(outcome(hand("7", "7", "7"), hand("A", "K")), "dealer");
  assert.equal(outcome(hand("A", "K"), hand("A", "Q")), "push");
  assert.equal(outcome(hand("K", "8"), hand("9", "9")), "push");
  assert.equal(outcome(hand("K", "8"), hand("10", "9")), "dealer");
  assert.equal(isBlackjack(hand("A", "5", "5")), false);
});

test("the shoe holds six decks and reshuffles at the cut card", () => {
  const shoe = createShoe();
  assert.equal(shoe.size, 312);
  const counts = new Map();
  for (const card of shoe.cards) counts.set(key(card), (counts.get(key(card)) ?? 0) + 1);
  assert.equal(counts.size, 52);
  assert.ok([...counts.values()].every((n) => n === 6));
  assert.equal(needsShuffle(null), true);
  assert.equal(needsShuffle(shoe), false);
  shoe.cards.splice(0, 233); // 79 left: just above the 25% that remains at the cut
  assert.equal(needsShuffle(shoe), false);
  shoe.cards.pop();
  assert.equal(needsShuffle(shoe), true);
});
