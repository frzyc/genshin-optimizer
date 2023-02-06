/* eslint-disable @typescript-eslint/no-explicit-any */
import { travelerElements } from "../Types/consts"
import { DBStorage } from "./DBStorage"
import { IGO, IGOOD } from "./exim"

// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateGOOD` function
// 2. Add new `migrateVersion` call within `migrate` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

export const currentDBVersion = 22

export function migrateGOOD(good: IGOOD & IGO): IGOOD & IGO {

  const version = good.dbVersion ?? 0
  function migrateVersion(version: number, cb: () => void) {
    const dbver = good.dbVersion ?? 0
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      good.dbVersion = version
    }
  }

  // Default GOOD set version
  migrateVersion(8, () => { })

  // 8.20.0 - 8.21.0
  migrateVersion(20, () => {
    // convert from "Traveler" to element specific "Traveler..."
    if (!good.characters) return
    const key = "Traveler"
    const charInd = good.characters.findIndex(c => c.key === key)
    if (charInd === -1) return
    const character = good.characters![charInd]!
    good.characters.splice(charInd, 1)
    travelerElements.forEach(ele => {
      const targets = character?.customMultiTargets?.[ele] ?? []
      good.characters!.push({ ...character, customMultiTarget: targets, key: `Traveler${ele[0].toUpperCase() + ele.slice(1)}` })
    })
  })

  // 8.22.0 - 8.27.0
  migrateVersion(21, () => {
    const states = (good as any).states as Array<object & { key: string }> | undefined
    if (states) (states as any[]).forEach(value => {
      if (value.key) {
        if (value.key === "dbMeta")
          (good as any).dbMeta = value
        if (value.key === "ArtifactDisplay")
          (good as any).display_artifact = value
        if (value.key === "WeaponDisplay")
          (good as any).display_weapon = value
        if (value.key === "CharacterDisplay")
          (good as any).display_character = value
        if (value.key === "TabOptimize")
          (good as any).display_optimize = value

        if (value.key.startsWith("charMeta_")) {
          const [, charKey] = value.key.split("charMeta_")
          value.id = charKey
          if (!(good as any).charMetas) (good as any).charMetas = [value]
          else (good as any).charMetas.push(value)
        }
      }
    })

    const buildSettings = (good as any).buildSettings
    if (buildSettings)
      good.buildSettings = buildSettings.map(b => ({ ...b, id: b.key }))
  })

  // 8.28.0 - Present
  migrateVersion(22, () => {
    const buildSettings = (good as any).buildSettings
    if (buildSettings) {
      good.buildSettings = buildSettings.map(b => {
        const statFilters = (b as any).statFilters
        const newStatFilters = Object.fromEntries(Object.entries(statFilters)
          .filter(([, value]) => !Array.isArray(value))
          .map(([statKey, value]) => ([
            `["basic","${statKey}"]`,
            [{
              "value": value,
              "disabled": false
            }]
          ]))
        )
        return { ...b, statFilters: newStatFilters }
      })
    }
  })

  good.dbVersion = currentDBVersion
  if (version > currentDBVersion) throw new Error(`Database version ${version} is not supported`)
  return good
}

/**
 * Migrate parsed data in `storage` in-place to a parsed data of the latest supported DB version.
 *
 * **CAUTION**
 * Throw an error if `storage` uses unsupported DB version.
 */
export function migrate(storage: DBStorage) {
  const version = storage.getDBVersion()

  function migrateVersion(version: number, cb: () => void) {
    const dbver = storage.getDBVersion()
    if (dbver < version) {
      cb()
      // Update version upon each successful migration, so we don't
      // need to migrate that part again if later parts fail.
      storage.setDBVersion(version)
    }
  }

  migrateVersion(8, () => { })

  // 6.1.9 - 6.2.3
  migrateVersion(11, () => {
    for (const key of storage.keys) {
      if (key.startsWith("char_")) {
        const character = storage.get(key)
        if (!character) continue
        const baseStatOverrides = character?.baseStatOverrides ?? {}
        if (!baseStatOverrides) continue
        if (baseStatOverrides.critRate_) baseStatOverrides.critRate_ -= 5
        if (baseStatOverrides.critDMG_) baseStatOverrides.critDMG_ -= 50
        if (baseStatOverrides.enerRech_) baseStatOverrides.enerRech_ -= 100

        character.bonusStats = baseStatOverrides
        delete character.baseStatOverrides
        storage.set(key, character)
      }
    }
  })

  // 8.20.0 - 8.21.0
  migrateVersion(20, () => {
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
  })

  // 8.22.0 - 8.27.0
  migrateVersion(21, () => {
    function swap(from, to) {
      const data = storage.get(from)
      if (!data) return
      storage.remove(from)
      storage.set(to, data)
    }
    for (const key of storage.keys) {
      if (key.startsWith("state_")) {
        const data = storage.get(key)
        if (data.key)
          storage.set(key, { ...data, id: data.key })
      }
      if (key.startsWith("state_charMeta"))
        swap(key, key.slice(6))
    }
    swap("state_dbMeta", "dbMeta")
    swap("state_WeaponDisplay", "display_weapon")
    swap("state_ArtifactDisplay", "display_artifact")
    swap("state_TabOptimize", "display_optimize")
    swap("state_CharacterDisplay", "display_character")
  })

  // 8.28.0 - Present
  migrateVersion(22, () => {
    for (const key of storage.keys) {
      if (key.startsWith("buildSetting_")) {
        const buildSettings = storage.get(key)
        const statFilters = buildSettings.statFilters
        const newStatFilters = Object.fromEntries(Object.entries(statFilters)
          .filter(([, value]) => !Array.isArray(value))
          .map(([statKey, value]) => ([
            `["basic","${statKey}"]`,
            [{
              "value": value,
              "disabled": false
            }]
          ]))
        )
        storage.set(key, { ...buildSettings, statFilters: newStatFilters })
      }
    }
  })

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion) throw new Error(`Database version ${version} is not supported`)
}
