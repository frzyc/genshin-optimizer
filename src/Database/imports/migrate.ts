import { crawlObject, layeredAssignment } from "../../Util/Util"
import { DBStorage } from "../DBStorage"
import { getDBVersion, setDBVersion } from "../utils"

// MIGRATION STEP
// 0. DO NOT change old `migrateV<x>ToV<x+1>` code
// 1. Add new `migrateV<x>ToV<x+1>`
// 2. Call the added `migrateV<x>ToV<x+1>` from `migrate`
// 3. Update `currentDBVersion`

export const currentDBVersion = 16

/**
 * Migrate parsed data in `storage` in-place to a parsed data of the latest supported DB version.
 *
 * **CAUTION**
 * Throw an error if `storage` uses unsupported DB version.
 */
export function migrate(storage: DBStorage): { migrated: boolean } {
  const version = getDBVersion(storage)
  if (version === 0) {
    setDBVersion(storage, currentDBVersion)
    return { migrated: false }
  }

  // Update version upon each successful migration, so we don't
  // need to migrate that part again if later parts fail.
  if (version < 8) throw new Error(`Database version ${version} is no longer supported`)
  if (version < 9) { migrateV8ToV9(storage); setDBVersion(storage, 9) }
  if (version < 10) { migrateV9ToV10(storage); setDBVersion(storage, 10) }
  if (version < 11) { migrateV10ToV11(storage); setDBVersion(storage, 11) }
  if (version < 12) { migrateV11ToV12(storage); setDBVersion(storage, 12) }
  if (version < 13) { migrateV12ToV13(storage); setDBVersion(storage, 13) }
  if (version < 14) { migrateV13ToV14(storage); setDBVersion(storage, 14) }
  if (version < 15) { migrateV14ToV15(storage); setDBVersion(storage, 15) }
  if (version < 16) { migrateV15ToV16(storage); setDBVersion(storage, 16) }
  if (version > currentDBVersion) throw new Error(`Database version ${version} is not supported`)

  return { migrated: version < getDBVersion(storage) }
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

// 7.0.0 - 7.2.11
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

// 7.3.0 - 7.4.2
function migrateV12ToV13(storage: DBStorage) {
  // UI was changed quite a lot, deleting state should be easiest for migration.
  storage.remove("ArtifactDisplay.state")
}

// 7.5.0 - 7.8.5
function migrateV13ToV14(storage: DBStorage) {
  // Migrate conditionalValues due to keys changes
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      const newCondValues = {}
      crawlObject(character.conditionalValues, [], c => Array.isArray(c), (conditionalValue, keys) => {
        const [type, subkey] = keys
        if (type === "character") {
          if (subkey === "Traveler") {
            // character, traveler, sheet, talents, element, condKey
            let [character, traveler, , , element, condKey] = keys
            if (!condKey || !element) return
            if (element === "electro" && condKey === "sk") condKey = "e"
            layeredAssignment(newCondValues, [character, `${traveler}_${element}`, condKey], conditionalValue)
          } else {
            // character, charKey, sheet, talent, condKey
            let [character, charKey, , , condKey] = keys
            if (!condKey) return
            switch (charKey) {
              case "Diona":
                if (condKey === "c4") condKey = "a1"
                break;
              case "Diluc":
                if (condKey === "b") condKey = "q"
                break;
              case "KamisatoAyaka":
                if (condKey === "p1") condKey = "a1"
                if (condKey === "p2") condKey = "a4"
                break;
              case "RaidenShogun":
                if (condKey === "sk") condKey = "e"
                if (condKey === "skp") condKey = "ep"
                if (condKey === "res") condKey = "q"
                break;
              case "SangonomiyaKokomi":
                if (condKey === "b") condKey = "q"
                break;
              case "Xiao":
                if (condKey === "a1") condKey = "a4"
                break;
              case "Xinyan":
                if (condKey === "a1") condKey = "c1"
                break;
              case "Yanfei":
                if (condKey === "p1") condKey = "a1"
                break;
              case "Zhongli":
                if (condKey === "sk") condKey = "e"
                break;
              default:
                break;
            }
            layeredAssignment(newCondValues, [character, charKey, condKey], conditionalValue)
          }
        } else if (type === "weapon") {
          let [weapon, weaponKey, condKey] = keys
          if (!condKey) return
          if (weaponKey === "Whiteblind" && condKey === "infusionBlade") condKey = "ib"
          if (weaponKey === "PrototypeRancour" && condKey === "smashedStone") condKey = "ss"
          layeredAssignment(newCondValues, [weapon, weaponKey, condKey], conditionalValue)
        } else if (type === "artifact") {
          let [artifact, setKey, condKey] = keys
          if (!condKey) return
          layeredAssignment(newCondValues, [artifact, setKey, condKey, condKey], conditionalValue)
        }
      })
      character.conditionalValues = newCondValues
      character.team = ["", "", ""]
      storage.set(key, character)
    }
  }
}
// 8.0.0 - 8.5.3
function migrateV14ToV15(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      delete character.buildSettings
      delete character.bonusStats
      storage.set(key, character)
    }
  }
}
// 8.6.0 - Present
function migrateV15ToV16(storage: DBStorage) {
  const state_ArtifactDisplay = storage.get("state_ArtifactDisplay")
  if (state_ArtifactDisplay?.filterOption) {
    delete state_ArtifactDisplay.filterOption.excluded
    storage.set("state_ArtifactDisplay", state_ArtifactDisplay)
  }
}
