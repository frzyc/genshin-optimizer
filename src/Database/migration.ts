import { initialBuildSettings } from "../Build/BuildSetting"
import { ascensionMaxLevel } from "../Data/CharacterData"
import { DBStorage } from "./DBStorage"
import { getDBVersion, setDBVersion } from "./utils"

const currentDBVersion = 7

export function migrate(storage: DBStorage): { migrated: boolean } {
  const version = getDBVersion(storage)
  const report = { migrated: false }

  if (version > currentDBVersion)
    throw new Error("Database is not supported")

  // Update version upon each successful migration, so we don't
  // need to migrate that part again if later parts fail.
  if (version < 3) { migrateV2ToV3(storage); setDBVersion(storage, 3) }
  if (version < 4) { migrateV3ToV4(storage); setDBVersion(storage, 4) }
  if (version < 5) { migrateV4ToV5(storage); setDBVersion(storage, 5) }
  if (version < 6) { migrateV5ToV6(storage); setDBVersion(storage, 6) }
  if (version < 7) { migrateV6ToV7(storage); setDBVersion(storage, 7) }

  if (version < currentDBVersion)
    report.migrated = true

  setDBVersion(storage, currentDBVersion)

  return report
}
/// v4.0.0 - v4.23.2
function migrateV2ToV3(storage: DBStorage) {
  const state = storage.get("CharacterDisplay.state")
  if (state) {
    if (Array.isArray(state.elementalFilter)) state.elementalFilter = ""
    if (Array.isArray(state.weaponFilter)) state.weaponFilter = ""
    storage.set("CharacterDisplay.state", state)
  }

  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const value = storage.get(key)
      if (!value) continue
      if (value.buildSetting) {
        const { artifactsAssumeFull = false, ascending = false, mainStat = ["", "", ""], setFilters = [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }], useLockedArts = false } = value.buildSetting ?? {}
        value.buildSettings = { mainStatAssumptionLevel: artifactsAssumeFull ? 20 : 0, ascending, mainStatKeys: mainStat, setFilters, useLockedArts }
      }

      storage.set(key, value)
    }
  }
}
/// v5.0.0 - v5.7.15
function migrateV3ToV4(storage: DBStorage) { // 
  // Convert anemo traveler to traveler, and remove geo traveler
  const traveler = storage.get("char_traveler_anemo")
  // Deletion of old travelers are handled during validation

  if (traveler) {
    traveler.elementKey = "anemo"
    traveler.characterKey = "traveler"
    storage.set("char_traveler", traveler)
  }

  for (const key of storage.keys) {
    if (key.startsWith("artifact_")) {
      const value = storage.get(key)
      let requireUpdate = false
      if (value.location === "traveler_anemo") {
        value.location = "traveler"
        requireUpdate = true
      } else if (value.location === "traveler_geo") {
        value.location = ""
        requireUpdate = true
      }

      if (requireUpdate)
        storage.set(key, value)
    }
  }
}
/// v5.8.0 - v5.11.5
function migrateV4ToV5(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const value = storage.get(key)

      const levelKey = value.levelKey ?? "L1"
      const [, lvla] = levelKey.split("L")
      const level = parseInt(lvla)
      const ascension = ascensionMaxLevel.findIndex(maxLevel => level <= maxLevel)
      const addAsc = lvla.includes("A")
      if (level < 0 || level > 90 || ascension < 0) {
        value.level = 1
        value.ascension = 0
      } else {
        value.level = level
        value.ascension = ascension + (addAsc ? 1 : 0)
      }

      // TODO: Remove this once we validate baseStatOverrides
      delete value.baseStatOverrides?.characterLevel
      delete value.baseStatOverrides?.characterHP
      delete value.baseStatOverrides?.characterATK
      delete value.baseStatOverrides?.characterDEF

      storage.set(key, value)
    }
  }
}

// v5.12.0 - 5.19.14
function migrateV5ToV6(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)

      //migrate character weapon levels
      const levelKey = character.weapon.levelKey ?? "L1"
      const [, lvla] = levelKey.split("L")
      const level = parseInt(lvla)
      const ascension = ascensionMaxLevel.findIndex(maxLevel => level <= maxLevel)
      const addAsc = lvla.includes("A")
      if (level < 0 || level > 90 || ascension < 0) {
        character.weapon.level = 1
        character.weapon.ascension = 0
      } else {
        character.weapon.level = level
        character.weapon.ascension = ascension + (addAsc ? 1 : 0)
      }
      storage.set(key, character)
    }
  }
}

// 5.20.0 - present
function migrateV6ToV7(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      if (!character.buildSettings) character.buildSettings = initialBuildSettings()
      else {
        const [sands, goblet, circlet] = (Array.isArray(character.buildSettings?.mainStatKeys) && character.buildSettings?.mainStatKeys) || []
        character.buildSettings.mainStatKeys = initialBuildSettings().mainStatKeys
        if (sands) character.buildSettings.mainStatKeys.sands = [sands]
        if (goblet) character.buildSettings.mainStatKeys.goblet = [goblet]
        if (circlet) character.buildSettings.mainStatKeys.circlet = [circlet]
      }
      storage.set(key, character)
    }
  }
}