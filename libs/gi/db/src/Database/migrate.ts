/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DBStorage } from '@genshin-optimizer/common/database'
import type {
  CharacterKey,
  ElementKey,
  HitModeKey,
  LocationCharacterKey,
  TravelerKey,
} from '@genshin-optimizer/gi/consts'
import {
  allLocationCharacterKeys,
  travelerElements,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter, IGOOD } from '@genshin-optimizer/gi/good'
import type { CustomMultiTarget } from '../Interfaces/CustomMultiTarget'
import type { Team, TeamCharacter } from './DataManagers'
import type { IGO } from './exim'

// MIGRATION STEP
// 0. DO NOT change old `migrateVersion` calls
// 1. Add new `migrateVersion` call within `migrateGOOD` function
// 2. Add new `migrateVersion` call within `migrate` function
// 3. Update `currentDBVersion`
// 4. Test on import, and also on version update

export const currentDBVersion = 24

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
  migrateVersion(8, () => null)

  // 8.20.0 - 8.21.0
  migrateVersion(20, () => {
    // convert from "Traveler" to element specific "Traveler..."
    const characters = good.characters
    if (!characters) return
    const key = 'Traveler'
    const charInd = characters.findIndex((c) => (c.key as string) === key)
    if (charInd === -1) return
    const character = characters[charInd]
    if (!character) return
    characters.splice(charInd, 1)
    travelerElements.forEach((ele) => {
      const targets =
        (
          character as unknown as {
            customMultiTargets: Partial<Record<ElementKey, CustomMultiTarget[]>>
          }
        )?.customMultiTargets?.[ele] ?? []
      characters.push({
        ...character,
        customMultiTarget: targets,
        key: `Traveler${ele[0].toUpperCase() + ele.slice(1)}` as TravelerKey,
      } as ICharacter)
    })
  })

  // 8.22.0 - 8.27.0
  migrateVersion(21, () => {
    const states = (good as any).states as
      | Array<object & { key: string }>
      | undefined
    if (states)
      (states as any[]).forEach((value) => {
        if (value.key) {
          if (value.key === 'dbMeta') (good as any).dbMeta = value
          if (value.key === 'ArtifactDisplay')
            (good as any).display_artifact = value
          if (value.key === 'WeaponDisplay')
            (good as any).display_weapon = value
          if (value.key === 'CharacterDisplay')
            (good as any).display_character = value
          if (value.key === 'TabOptimize')
            (good as any).display_optimize = value

          if (value.key.startsWith('charMeta_')) {
            const [, charKey] = value.key.split('charMeta_')
            value.id = charKey
            if (!(good as any).charMetas) (good as any).charMetas = [value]
            else (good as any).charMetas.push(value)
          }
        }
      })

    const buildSettings = (good as any).buildSettings
    if (buildSettings)
      good.buildSettings = buildSettings.map((b: any) => ({ ...b, id: b.key }))
  })

  // 8.28.0 - 9.5.2
  migrateVersion(22, () => {
    const buildSettings = (good as any).buildSettings
    if (buildSettings) {
      good.buildSettings = buildSettings.map((b: any) => {
        const statFilters = (b as any).statFilters
        const newStatFilters = Object.fromEntries(
          Object.entries(statFilters)
            .filter(([, value]) => !Array.isArray(value))
            .map(([statKey, value]) => [
              `["basic","${statKey}"]`,
              [
                {
                  value: value,
                  disabled: false,
                },
              ],
            ])
        )
        return { ...b, statFilters: newStatFilters }
      })
    }
  })

  // 9.5.3 - 9.22.2
  migrateVersion(23, () => {
    const buildSettings = (good as any).buildSettings
    if (buildSettings) {
      good.buildSettings = buildSettings.map((b: any) => {
        const allowLocations: LocationCharacterKey[] = b.allowLocations
        if (allowLocations) {
          // Invert the list; should be all location keys that are not in allowLocations
          // We will remove extra keys later in validation code
          const excludedLocations = allLocationCharacterKeys.filter(
            (loc) => !allowLocations.includes(loc)
          )
          delete b.allowLocations
          return { ...b, excludedLocations, allowLocationsState: 'customList' }
        }
        return b
      })
    }
  })

  // 10.0.0 - present
  migrateVersion(24, () => {
    const chars = (good as any).characters
    const buildSettings = (good as any).buildSettings
    if (!chars || !buildSettings) return

    if (!good['teams']) good['teams'] = []
    if (!good['teamchars']) good['teamchars'] = []
    if (!good['optConfigs']) good['optConfigs'] = []

    let teamInd = ((good['teams'] as Array<any>) ?? []).length
    let teamCharInd = ((good['teamchars'] as Array<any>) ?? []).length
    let optConfigInd = ((good['optConfigs'] as Array<any>) ?? []).length
    console.log({ chars, buildSettings })
    chars.forEach((char: any) => {
      const {
        key: characterKey,
        hitMode,
        reaction,
        conditional,
        bonusStats,
        enemyOverride,
        infusionAura,
        customMultiTarget,
        team: charTeam,
        teamConditional,
      } = char as IGOCharacter
      const optConfig =
        buildSettings.find(({ id }: { id: string }) => id === characterKey) ??
        {}
      const optConfigId = `optConfig_${optConfigInd++}`
      ;(good as any).optConfigs.push({ ...optConfig, id: optConfigId })

      const teamCharIds: string[] = []

      const teamCharMain: TeamCharacter = {
        key: characterKey,
        customMultiTargets: customMultiTarget,
        conditional,
        bonusStats,
        hitMode,
        reaction,
        infusionAura,
        optConfigId,
      } as TeamCharacter
      const teamCharMainId = `teamchar_${teamCharInd++}`
      ;(good as any).teamchars.push({ ...teamCharMain, id: teamCharMainId })
      teamCharIds.push(teamCharMainId)
      if (charTeam) {
        ;(charTeam.filter((c) => c) as CharacterKey[]).forEach((charK) => {
          const teamChar: TeamCharacter = {
            key: charK,
            conditional: teamConditional[charK] as any,
            bonusStats,
            hitMode,
          } as TeamCharacter
          const teamCharId = `teamchar_${teamCharInd++}`
          ;(good as any).teamchars.push({ ...teamChar, id: teamCharId })
          teamCharIds.push(teamCharId)
        })
      }
      const team: Team = {
        name: `${characterKey} Team`,
        description: `Generated team due to database migration for GO version 10`,
        enemyOverride,
        teamCharIds,
        lastEdit: 0,
      }
      const teamId = `team_${teamInd++}`
      ;(good as any).teams.push({ ...team, id: teamId })
    })
  })

  good.dbVersion = currentDBVersion
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
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

  migrateVersion(8, () => null)

  // 6.1.9 - 6.2.3
  migrateVersion(11, () => {
    for (const key of storage.keys) {
      if (key.startsWith('char_')) {
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
    const key = 'char_Traveler'
    const character = storage.get(key)
    if (!character) return
    storage.remove(key)
    travelerElements.forEach((ele) => {
      const targets = character?.customMultiTargets?.[ele] ?? []
      const charKey = `Traveler${ele[0].toUpperCase() + ele.slice(1)}`
      storage.set(`char_${charKey}`, {
        ...character,
        customMultiTarget: targets,
        key: charKey,
      })
    })
  })

  // 8.22.0 - 8.27.0
  migrateVersion(21, () => {
    function swap(from: string, to: string) {
      const data = storage.get(from)
      if (!data) return
      storage.remove(from)
      storage.set(to, data)
    }
    for (const key of storage.keys) {
      if (key.startsWith('state_')) {
        const data = storage.get(key)
        if (data.key) storage.set(key, { ...data, id: data.key })
      }
      if (key.startsWith('state_charMeta')) swap(key, key.slice(6))
    }
    swap('state_dbMeta', 'dbMeta')
    swap('state_WeaponDisplay', 'display_weapon')
    swap('state_ArtifactDisplay', 'display_artifact')
    swap('state_TabOptimize', 'display_optimize')
    swap('state_CharacterDisplay', 'display_character')
  })

  // 8.28.0 - 9.5.2
  migrateVersion(22, () => {
    for (const key of storage.keys) {
      if (key.startsWith('buildSetting_')) {
        const buildSettings = storage.get(key)
        const statFilters = buildSettings.statFilters
        const newStatFilters = Object.fromEntries(
          Object.entries(statFilters)
            .filter(([, value]) => !Array.isArray(value))
            .map(([statKey, value]) => [
              `["basic","${statKey}"]`,
              [
                {
                  value: value,
                  disabled: false,
                },
              ],
            ])
        )
        storage.set(key, { ...buildSettings, statFilters: newStatFilters })
      }
    }
  })

  // 9.5.3 - 9.22.2
  migrateVersion(23, () => {
    for (const key of storage.keys) {
      if (key.startsWith('buildSetting_')) {
        const b = storage.get(key)
        const allowLocations: LocationCharacterKey[] = b.allowLocations
        if (allowLocations) {
          // Invert the list; should be all location keys that are not in allowLocations
          // We will remove extra keys later in validation code
          const excludedLocations = allLocationCharacterKeys.filter(
            (loc) => !allowLocations.includes(loc)
          )
          delete b.allowLocations
          storage.set(key, {
            ...b,
            excludedLocations,
            allowLocationsState: 'customList',
          })
        }
      }
    }
  })

  // 10.0.0 - present
  migrateVersion(24, () => {
    const keys = storage.keys
    let teamInd = keys.filter((k) => k.startsWith(`team_`)).length
    let teamCharInd = keys.filter((k) => k.startsWith(`teamchar_`)).length
    let optConfigInd = keys.filter((k) => k.startsWith(`optConfig_`)).length
    for (const key of keys) {
      // convert character to a Team
      if (key.startsWith('char_')) {
        const {
          key: characterKey,
          hitMode,
          reaction,
          conditional,
          bonusStats,
          enemyOverride,
          infusionAura,
          customMultiTarget,
          team: charTeam,
          teamConditional,
        } = storage.get(key) as IGOCharacter
        const optConfig = storage.get(`buildSetting_${characterKey}`) ?? {}
        const optConfigId = `optConfig_${optConfigInd++}`
        storage.set(optConfigId, optConfig)

        const teamCharIds: string[] = []

        const teamCharMain: TeamCharacter = {
          key: characterKey,
          customMultiTargets: customMultiTarget,
          conditional,
          bonusStats,
          hitMode,
          reaction,
          infusionAura,
          optConfigId,
        } as TeamCharacter
        const teamCharMainId = `teamchar_${teamCharInd++}`
        storage.set(teamCharMainId, teamCharMain)
        teamCharIds.push(teamCharMainId)
        if (charTeam) {
          ;(charTeam.filter((c) => c) as CharacterKey[]).forEach((charK) => {
            const teamChar: TeamCharacter = {
              key: charK,
              conditional: teamConditional[charK] as any,
              bonusStats,
              hitMode,
            } as TeamCharacter
            const teamCharId = `teamchar_${teamCharInd++}`
            storage.set(teamCharId, teamChar)
            teamCharIds.push(teamCharId)
          })
        }
        const team: Team = {
          name: `${characterKey} Team`,
          description: `Generated team due to database migration for GO version 10`,
          enemyOverride,
          teamCharIds,
          lastEdit: 0,
        }
        storage.set(`team_${teamInd++}`, team)
      }
    }
  })

  storage.setDBVersion(currentDBVersion)
  if (version > currentDBVersion)
    throw new Error(`Database version ${version} is not supported`)
}

// used to migrate version 24
interface IGOCharacter extends ICharacter {
  // GO-specific
  hitMode: HitModeKey
  reaction?: string
  conditional: object
  bonusStats: Record<string, number>
  enemyOverride: Partial<Record<string, number>>
  infusionAura: string
  compareData: boolean
  customMultiTarget: CustomMultiTarget[]
  team: [
    teammate1: CharacterKey | '',
    teammate2: CharacterKey | '',
    teammate3: CharacterKey | ''
  ]
  teamConditional: Partial<Record<CharacterKey, object>>
}
