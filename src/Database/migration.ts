import { initialBuildSettings } from "../Build/BuildSetting"
import { ascensionMaxLevel } from "../Data/LevelData"
import { allCharacterKeys } from "../Types/consts"
import { DBStorage } from "./DBStorage"
import { getDBVersion, setDBVersion } from "./utils"

// MIGRATION STEP
// 0. DO NOT change old `migrateV<x>ToV<x+1>` code
// 1. Add new `migrateV<x>ToV<x+1>`
// 2. Call the added `migrateV<x>ToV<x+1>` from `migrate`
// 3. Update `currentDBVersion`

export const currentDBVersion = 12

export function migrate(storage: DBStorage): { migrated: boolean } {
  const version = getDBVersion(storage)

  // Update version upon each successful migration, so we don't
  // need to migrate that part again if later parts fail.
  if (version < 3) { migrateV2ToV3(storage); setDBVersion(storage, 3) }
  if (version < 4) { migrateV3ToV4(storage); setDBVersion(storage, 4) }
  if (version < 5) { migrateV4ToV5(storage); setDBVersion(storage, 5) }
  if (version < 6) { migrateV5ToV6(storage); setDBVersion(storage, 6) }
  if (version < 7) { migrateV6ToV7(storage); setDBVersion(storage, 7) }
  if (version < 8) { migrateV7ToV8(storage); setDBVersion(storage, 8) }
  if (version < 9) { migrateV8ToV9(storage); setDBVersion(storage, 9) }
  if (version < 10) { migrateV9ToV10(storage); setDBVersion(storage, 10) }
  if (version < 11) { migrateV10ToV11(storage); setDBVersion(storage, 11) }
  if (version < 12) { migrateV11ToV12(storage); setDBVersion(storage, 12) }

  if (version > currentDBVersion) throw new Error(`Database version ${version} is not supported`)

  return { migrated: version < getDBVersion(storage) }
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
        const { artifactsAssumeFull = false, ascending = false, mainStat = ["", "", ""], setFilters = [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }], useExcludedArts = false } = value.buildSetting ?? {}
        value.buildSettings = { mainStatAssumptionLevel: artifactsAssumeFull ? 20 : 0, ascending, mainStatKeys: mainStat, setFilters, useExcludedArts }
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

      // Migrate character weapon levels
      if (!character.weapon) continue
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

// 5.20.0 - 6.0.0
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

// 6.0.0 - 6.0.17
function migrateV7ToV8(storage: DBStorage) {
  const weaponKeyChangeMap = {
    "PrototypeAminus": "PrototypeArchaic",
    "PrototypeGrudge": "PrototypeStarglitter",
    "PrototypeMalice": "PrototypeAmber"
  } as const
  let keyInd = 1;
  function generateWeaponId(storage: DBStorage) {
    let key = `weapon_${keyInd++}`
    while (storage.keys.includes(key))
      key = `weapon_${keyInd++}`
    return key
  }

  const charMap = Object.fromEntries(allCharacterKeys.map(k => [k.toLowerCase(), k]))
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key), characterKey = character.characterKey
      // We delete old key upon validation

      const newCharacterKey = charMap[characterKey]

      // Rename characterKey
      character.key = newCharacterKey
      // Rename conditionalValues with characterKey
      if (character.conditionalValues?.character?.[characterKey]) {
        character.conditionalValues.character[newCharacterKey] = character.conditionalValues?.character?.[characterKey]
        delete character.conditionalValues?.character?.[characterKey]
      }

      // Convert base-0 `talentLevelKeys` to base-1 `talent`
      if (typeof character.talentLevelKeys === "object") {
        character.talent = Object.fromEntries(
          Object.entries(character.talentLevelKeys)
            .map(([key, value]: [any, any]) => [key, value + 1]))
      }

      //rename buildSettings.useLockedArts to buildSettings.useExcludedArts
      if (character.buildSettings?.useLockedArts !== undefined) {
        character.buildSettings.useExcludedArts = character.buildSettings.useLockedArts
        delete character.buildSettings.useLockedArts
      }

      const { weapon, ...rest } = character
      if (!weapon) continue
      if (weaponKeyChangeMap[weapon.key])
        weapon.key = weaponKeyChangeMap[weapon.key]
      weapon.location = newCharacterKey
      weapon.refine = weapon.refineIndex + 1
      storage.set(generateWeaponId(storage), weapon)
      storage.set(`char_${newCharacterKey}`, rest)
    } else if (key.startsWith("artifact_")) {
      const artifact = storage.get(key)
      artifact.location = charMap[artifact.location]
      artifact.exclude = artifact.lock
      artifact.rarity = artifact.numStars
      storage.set(key, artifact)
    }
  }
  const BuildsDisplayState = storage.get("BuildsDisplay.state")
  if (BuildsDisplayState) {
    BuildsDisplayState.characterKey = charMap[BuildsDisplayState.characterKey] ?? ""
    // Limit maxBuildsToShow
    BuildsDisplayState.maxBuildsToShow = BuildsDisplayState.maxBuildsToShow > 10 ? 5 : BuildsDisplayState.maxBuildsToShow
    storage.set("BuildsDisplay.state", BuildsDisplayState)
  }
  const CharacterDisplayState = storage.get("CharacterDisplay.state")
  if (CharacterDisplayState) {
    CharacterDisplayState.characterKeyToEdit = charMap[CharacterDisplayState.charIdToEdit] ?? ""
    delete CharacterDisplayState.charIdToEdit
    storage.set("CharacterDisplay.state", CharacterDisplayState)
  }
}
// 6.1.0 - 6.1.5
function migrateV8ToV9(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      const { buildSettings = {} } = character
      delete buildSettings.ascending
      const { statFilters = {} } = buildSettings
      for (const key in statFilters) {
        if (statFilters[key]?.min)
          statFilters[key] = statFilters[key].min
        else
          delete statFilters[key]
      }
      storage.set(key, character)
    }
  }
}

// 6.1.6 - 6.1.8
function migrateV9ToV10(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("weapon_")) {
      const weapon = storage.get(key)
      if (weapon.refine) {
        weapon.refinement = weapon.refine
        storage.set(key, weapon)
      }
    }
  }
}

// 6.1.9 - 6.2.3
function migrateV10ToV11(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      const { baseStatOverrides = {} } = character
      if (baseStatOverrides.critRate_) baseStatOverrides.critRate_ -= 5
      if (baseStatOverrides.critDMG_) baseStatOverrides.critDMG_ -= 50
      if (baseStatOverrides.enerRech_) baseStatOverrides.enerRech_ -= 100

      character.bonusStats = baseStatOverrides
      delete character.baseStatOverrides
      storage.set(key, character)
    }
  }
}

// 7.0.0 - present
function migrateV11ToV12(storage: DBStorage) {
  //UI was changed quite a lot, deleting state should be easiest for migration.
  storage.remove("CharacterDisplay.state")
  storage.remove("WeaponDisplay.state")

  for (const key of storage.keys) {
    if (key.startsWith("weapon_")) {
      const weapon = storage.get(key)
      if (weapon.lock === undefined) weapon.lock = false
      storage.set(key, weapon)
    }
  }
}