import { allSubstatKeys } from "../../Types/artifact"
import { allElements, allWeaponTypeKeys, travelerElements } from "../../Types/consts"
import { crawlObject, layeredAssignment } from "../../Util/Util"
import { DBStorage } from "../DBStorage"

// MIGRATION STEP
// 0. DO NOT change old `migrateV<x>ToV<x+1>` code
// 1. Add new `migrateV<x>ToV<x+1>`
// 2. Call the added `migrateV<x>ToV<x+1>` from `migrate`
// 3. Update `currentDBVersion`

export const currentDBVersion = 20

/**
 * Migrate parsed data in `storage` in-place to a parsed data of the latest supported DB version.
 *
 * **CAUTION**
 * Throw an error if `storage` uses unsupported DB version.
 */
export function migrate(storage: DBStorage): { migrated: boolean } {
  const version = storage.getDBVersion()

  // Update version upon each successful migration, so we don't
  // need to migrate that part again if later parts fail.
  if (version < 8) {
    storage.clear()
    storage.setDBVersion(currentDBVersion)
    return { migrated: false }
  }
  if (version < 9) { migrateV8ToV9(storage); storage.setDBVersion(9) }
  if (version < 10) { migrateV9ToV10(storage); storage.setDBVersion(10) }
  if (version < 11) { migrateV10ToV11(storage); storage.setDBVersion(11) }
  if (version < 12) { migrateV11ToV12(storage); storage.setDBVersion(12) }
  if (version < 13) { migrateV12ToV13(storage); storage.setDBVersion(13) }
  if (version < 14) { migrateV13ToV14(storage); storage.setDBVersion(14) }
  if (version < 15) { migrateV14ToV15(storage); storage.setDBVersion(15) }
  if (version < 16) { migrateV15ToV16(storage); storage.setDBVersion(16) }
  if (version < 17) { migrateV16toV17(storage); storage.setDBVersion(17) }
  if (version < 18) { migrateV17toV18(storage); storage.setDBVersion(18) }
  if (version < 19) { migrateV18toV19(storage); storage.setDBVersion(19) }
  if (version < 20) { migrateV19toV20(storage); storage.setDBVersion(20) }

  if (version > currentDBVersion) throw new Error(`Database version ${version} is not supported`)

  return { migrated: version < storage.getDBVersion() }
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
// 8.6.0 - 8.7.5
function migrateV15ToV16(storage: DBStorage) {
  const state_ArtifactDisplay = storage.get("state_ArtifactDisplay")
  if (state_ArtifactDisplay?.filterOption) {
    delete state_ArtifactDisplay.filterOption.excluded
    storage.set("state_ArtifactDisplay", state_ArtifactDisplay)
  }
}
// 8.8.0 - 8.8.1
function migrateV16toV17(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const character = storage.get(key)
      const buildSetting = character.buildSettings

      delete character.buildSettings
      storage.set(key, character)
      if (buildSetting) {
        delete buildSetting.setFilters
        buildSetting.artSetExclusion = {}
        storage.set(`buildSetting_${key.split("char_")[1]}`, buildSetting)
      }
    }
  }
}
// 8.8.2 - 8.11.0
function migrateV17toV18(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("buildSetting_")) {
      const buildSetting = storage.get(key)
      buildSetting.builds = []
      buildSetting.buildDate = 0
      storage.set(key, buildSetting)
    }
    if (key === "state_WeaponDisplay") {
      const state = storage.get(key)
      state.weaponType = [...allWeaponTypeKeys]
      storage.set(key, state)
    }
    if (key === "state_CharacterDisplay") {
      const state = storage.get(key)
      state.weaponType = [...allWeaponTypeKeys]
      state.element = [...allElements]
      storage.set(key, state)
    }
  }
}
// 8.11.0 - 8.19.2
function migrateV18toV19(storage: DBStorage) {
  for (const key of storage.keys) {
    if (key.startsWith("char_")) {
      const characterKey = key.split("_")[1]
      if (!characterKey) return
      const character = storage.get(key)
      const favorite = character.favorite

      const charMeta = {
        favorite,
        rvFilter: [...allSubstatKeys]
      }

      storage.set(`state_charMeta_${characterKey}`, charMeta)
    }
  }
}

// 8.20.0 - Present
function migrateV19toV20(storage: DBStorage) {
  // convert from "Traveler" to element specific "Traveler..."
  const key = "char_Traveler"
  const character = storage.get(key)
  if (!character) return
  storage.remove(key)
  travelerElements.forEach(ele => {
    const targets = character?.customMultiTargets?.[ele] ?? []
    const charKey = `Traveler${ele[0].toUpperCase() + ele.slice(1)}`
    storage.set(`char_${charKey}`, { ...character, customMultiTarget: targets, key: charKey })
  })
}
