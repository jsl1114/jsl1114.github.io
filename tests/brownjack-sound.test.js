import test from "node:test";
import assert from "node:assert/strict";
import { buzz, canVibrate, play } from "../public/projects/brownjack/js/sound.mjs";
import { getSettings, setSetting } from "../public/projects/brownjack/js/prefs.mjs";

test("sound and vibration are safe no-ops where they aren't available", () => {
  assert.equal(canVibrate(), false);
  for (const name of ["deal", "flip", "shuffle", "win", "blackjack", "push", "lose", "bust", "common", "rare", "epic", "legendary", "division", "tier", "no-such-sound"]) {
    assert.doesNotThrow(() => play(name));
  }
  assert.doesNotThrow(() => buzz("bust"));
});

test("preferences default on and can be switched off", () => {
  assert.deepEqual(getSettings(), { sound: true, haptics: true, coach: false, table: "oak", cardBack: "classic", unlocksSeen: null, hallNoticeSeen: false });
  assert.equal(setSetting("sound", false).sound, false);
  assert.equal(getSettings().sound, false);
  assert.equal(getSettings().haptics, true);
});
