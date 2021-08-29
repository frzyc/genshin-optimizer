import { initialBuildSettings } from "../Build/BuildSetting"
import { ascensionMaxLevel } from "../Data/CharacterData"
import { getDBVersion, load, save, setDBVersion } from "./utils"

const currentDBVersion = 7

export function migrate(storage: Storage): { migrated: boolean } {
  const version = getDBVersion(storage)
  const report = { migrated: false }

  if (version > currentDBVersion)
    throw new Error("Database is not supported")

  if (version < 3) migrateV2ToV3(storage)
  if (version < 4) migrateV3ToV4(storage)
  if (version < 5) migrateV4ToV5(storage)
  if (version < 6) migrateV5ToV6(storage)
  if (version < 7) migrateV6ToV7(storage)

  if (version < currentDBVersion) {
    report.migrated = true
  }

  setDBVersion(storage, currentDBVersion)

  return report
}
/// v4.0.0 - v4.23.2
function migrateV2ToV3(storage: Storage) {
  const state = load(storage, "CharacterDisplay.state")
  if (state) {
    if (Array.isArray(state.elementalFilter)) state.elementalFilter = ""
    if (Array.isArray(state.weaponFilter)) state.weaponFilter = ""
    save(storage, "CharacterDisplay.state", state)
  }

  for (const key in storage) {
    if (key.startsWith("char_")) {
      const value = load(storage, key)
      if (!value) continue
      if (value.buildSetting) {
        const { artifactsAssumeFull = false, ascending = false, mainStat = ["", "", ""], setFilters = [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }], useLockedArts = false } = value.buildSetting ?? {}
        value.buildSettings = { mainStatAssumptionLevel: artifactsAssumeFull ? 20 : 0, ascending, mainStatKeys: mainStat, setFilters, useLockedArts }
      }

      save(storage, key, value)
    }
  }
}
/// v5.0.0 - v5.7.15
function migrateV3ToV4(storage: Storage) { // 
  // Convert anemo traveler to traveler, and remove geo traveler
  const traveler = load(storage, "char_traveler_anemo")
  // Deletion of old travelers are handled during validation

  if (traveler) {
    traveler.elementKey = "anemo"
    traveler.characterKey = "traveler"
    save(storage, "char_traveler", traveler)
  }

  for (const key in storage) {
    if (key.startsWith("artifact_")) {
      const value = load(storage, key)
      let requireUpdate = false
      if (value.location === "traveler_anemo") {
        value.location = "traveler"
        requireUpdate = true
      } else if (value.location === "traveler_geo") {
        value.location = ""
        requireUpdate = true
      }

      if (requireUpdate)
        save(storage, key, value)
    }
  }
}
/// v5.8.0 - v5.11.5
function migrateV4ToV5(storage: Storage) {
  for (const key in storage) {
    if (key.startsWith("char_")) {
      const value = load(storage, key)

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

      save(storage, key, value)
    }
  }
}

// v5.12.0 - 5.19.14
function migrateV5ToV6(storage: Storage) {
  for (const key in storage) {
    if (key.startsWith("char_")) {
      const character = load(storage, key)

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
      save(storage, key, character)
    }
  }
}

// 5.20.0 - present
function migrateV6ToV7(storage: Storage) {
  for (const key in storage) {
    if (key.startsWith("char_")) {
      const character = load(storage, key)
      const [sands, goblet, circlet] = character.buildSettings.mainStatKeys
      character.buildSettings.mainStatKeys = initialBuildSettings().mainStatKeys
      if (sands) character.buildSettings.mainStatKeys.sands = [sands]
      if (goblet) character.buildSettings.mainStatKeys.goblet = [goblet]
      if (circlet) character.buildSettings.mainStatKeys.circlet = [circlet]
      save(storage, key, character)
    }
  }
}