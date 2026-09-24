import test from "node:test";
import assert from "node:assert/strict";
import { canSplit, createShoe, dealerShouldHit, handValue, isBlackjack, needsShuffle } from "../public/projects/brownjack/js/blackjack.mjs";
import { bestMove } from "../public/projects/brownjack/js/strategy.mjs";
import { GRADES, gradeOf, handChance, isHallOfFame, oneIn } from "../public/projects/brownjack/js/handodds.mjs";
import { HALL_SIZE, addToHall, hallWeek, hallWeeks, weekName, weekOf } from "../public/projects/brownjack/js/halloffame.mjs";

const cards = (...ranks) => ranks.map((rank, i) => ({ rank, suit: ["hearts", "clubs", "spades", "diamonds"][i % 4] }));

test("a hand's chance is its exact ranks, yours and the dealer's, from a six-deck shoe", () => {
  // One card each: 24 of 312 for your ace, then 24 of the 311 left for the dealer's king.
  assert.ok(Math.abs(handChance(cards("A"), cards("K")) - (24 / 312) * (24 / 311)) < 1e-12);
  // Your ace leaves 23 for the dealer.
  assert.ok(Math.abs(handChance(cards("A"), cards("A")) - (24 / 312) * (23 / 311)) < 1e-12);
  // Order and suits don't matter.
  assert.equal(handChance(cards("K", "9"), cards("6", "10")), handChance(cards("9", "K"), cards("10", "6")));
  // Repeats are rarer than a mix of the same length.
  assert.ok(handChance(cards("7", "7", "7"), cards("10", "8")) < handChance(cards("7", "6", "8"), cards("10", "8")));
  // Long hands don't underflow to zero.
  assert.ok(handChance(cards("2", "2", "2", "2", "3", "3", "3"), cards("4", "4", "4", "5")) > 0);
});

test("odds read as 1 in N, compact past a thousand", () => {
  assert.equal(oneIn(1 / 840), "1 in 840");
  assert.equal(oneIn(1 / 62_512), "1 in 62.5K");
  assert.equal(oneIn(1 / 4_200_000), "1 in 4.2M");
});

test("grades run D to SSS by rarity, and S and above make the Hall of Fame", () => {
  assert.deepEqual(GRADES.map((g) => g.grade), ["SSS", "SS", "S", "A", "B", "C", "D"]);
  assert.equal(gradeOf(1 / 10), "D");
  assert.equal(gradeOf(1 / 20_000_000), "SSS");
  assert.deepEqual(["SSS", "SS", "S", "A", "D"].map(isHallOfFame), [true, true, true, false, false]);
});

// Basic strategy from a six-deck shoe, as the cut-offs were set.
function simulate(hands, seed = 7) {
  let state = seed;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  let shoe = createShoe(6, random);
  const grades = {};
  for (let i = 0; i < hands; i++) {
    if (needsShuffle(shoe)) shoe = createShoe(6, random);
    const draw = () => shoe.cards.pop();
    const p = [draw()];
    const d = [draw()];
    p.push(draw());
    d.push(draw());
    let played = [p];
    if (!isBlackjack(d) && !isBlackjack(p)) {
      if (canSplit(p) && bestMove(p, d[0], { canSplit: true }) === "split") played = [[p[0], draw()], [p[1], draw()]];
      for (const h of played) {
        if (played.length > 1 && h[0].rank === "A") continue;
        for (;;) {
          const move = bestMove(h, d[0], { canDouble: h.length === 2 });
          if (move === "stand") break;
          h.push(draw());
          if (move === "double" || handValue(h).total >= 21) break;
        }
      }
      if (played.some((h) => handValue(h).total <= 21)) while (dealerShouldHit(d)) d.push(draw());
    }
    const grade = gradeOf(handChance(played.flat(), d));
    grades[grade] = (grades[grade] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(grades).map(([g, n]) => [g, n / hands]));
}

test("the grade cut-offs spread basic-strategy hands from common D to rare SSS", () => {
  const share = simulate(40_000);
  const targets = { D: 0.35, C: 0.25, B: 0.18, A: 0.12, S: 0.06, SS: 0.03, SSS: 0.01 };
  for (const [grade, target] of Object.entries(targets)) {
    assert.ok(Math.abs((share[grade] ?? 0) - target) < target * 0.35 + 0.004, `${grade}: ${share[grade]} vs ${target}`);
  }
});

test("the Hall of Fame keeps each week's ten rarest S-and-above hands", () => {
  const monday = Date.parse("2026-09-21T16:00:00Z");
  const day = 86_400_000;
  assert.equal(weekOf(monday + 6 * day), "2026-09-21");
  assert.equal(weekOf(Date.parse("2026-09-28T03:00:00Z")), "2026-09-21", "Sunday 11pm Eastern is still that week");
  assert.equal(weekOf(monday + 7 * day), "2026-09-28");
  assert.equal(weekName("2026-09-28"), "Sep 28 – Oct 4");

  const entry = (i, chance, grade = "S", at = monday + i * 1000) => ({ at, chance, grade });
  let hall = [];
  assert.equal(addToHall(hall, entry(0, 1e-5, "A")).place, null, "A doesn't qualify");
  for (let i = 0; i < 12; i++) hall = addToHall(hall, entry(i, (i + 1) * 1e-7)).hall;
  assert.equal(hallWeek(hall, "2026-09-21").length, HALL_SIZE);
  assert.equal(addToHall(hall, entry(20, 5e-6)).place, null, "commoner than the tenth doesn't get in");
  const rarest = addToHall(hall, entry(21, 1e-9, "SSS"));
  assert.equal(rarest.place, 1);
  assert.equal(hallWeek(rarest.hall, "2026-09-21")[0].grade, "SSS");
  assert.equal(hallWeek(rarest.hall, "2026-09-21").length, HALL_SIZE);

  const nextWeek = addToHall(rarest.hall, entry(0, 1e-6, "S", monday + 7 * day)).hall;
  assert.deepEqual(hallWeeks(nextWeek, monday + 7 * day), ["2026-09-28", "2026-09-21"]);
});
