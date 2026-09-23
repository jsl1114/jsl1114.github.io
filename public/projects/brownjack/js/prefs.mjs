// prefs.mjs — the player's per-browser preferences. Not part of the save file:
// these describe this device, not the player's progress.

const SETTINGS_KEY = 'brownjack.settings.v1'
// unlocksSeen: ids of tables and backs already announced (null until first run).
const DEFAULTS = { sound: true, haptics: true, coach: false, table: 'oak', cardBack: 'classic', unlocksSeen: null }

let settings = loadSettings()

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(globalThis.localStorage?.getItem(SETTINGS_KEY) ?? '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

export const getSettings = () => ({ ...settings })

export function setSetting(key, value) {
  settings = { ...settings, [key]: value }
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Not persisted, but the choice still holds for this visit.
  }
  return getSettings()
}
