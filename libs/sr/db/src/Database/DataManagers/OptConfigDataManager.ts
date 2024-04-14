import {
  deepClone,
  deepFreeze,
  objKeyMap,
  validateArr,
} from '@genshin-optimizer/common/util'
import type {
  CharacterLocationKey,
  RelicMainStatKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  allCharacterLocationKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

export const maxBuildsToShowList = [1, 2, 3, 4, 5, 8, 10] as const
export const maxBuildsToShowDefault = 5

export const allAllowLocationsState = [
  'unequippedOnly',
  'customList',
  'all',
] as const
export type AllowLocationsState = (typeof allAllowLocationsState)[number]

export const allRelicSetExclusionKeys = [...allRelicSetKeys, 'rainbow'] as const
export type RelicSetExclusionKey = (typeof allRelicSetExclusionKeys)[number]

export type RelicSetExclusion = Partial<Record<RelicSetExclusionKey, (2 | 4)[]>>

export interface StatFilterSetting {
  value: number
  disabled: boolean
}
export type StatFilters = Record<string, StatFilterSetting[]>

export type GeneratedBuild = {
  lightConeId?: string
  relicIds: Record<RelicSlotKey, string | undefined>
}

export interface OptConfig {
  relicSetExclusion: RelicSetExclusion
  statFilters: StatFilters
  mainStatKeys: {
    body: RelicMainStatKey[]
    feet: RelicMainStatKey[]
    sphere: RelicMainStatKey[]
    rope: RelicMainStatKey[]
    head?: never
    hand?: never
  }
  excludedLocations: CharacterLocationKey[]
  allowLocationsState: AllowLocationsState
  relicExclusion: string[]
  useExcludedRelics: boolean
  optimizationTarget?: string[]
  mainStatAssumptionLevel: number
  allowPartial: boolean
  maxBuildsToShow: number
  plotBase?: string[]
  compareBuild: boolean
  levelLow: number
  levelHigh: number
  useTeammateBuild: boolean

  //generated opt builds
  builds: Array<GeneratedBuild>
  buildDate: number
}

export class OptConfigDataManager extends DataManager<
  string,
  'optConfigs',
  OptConfig,
  OptConfig
> {
  constructor(database: SroDatabase) {
    super(database, 'optConfigs')
  }
  override validate(obj: object, key: string): OptConfig | undefined {
    if (typeof obj !== 'object') return undefined
    let {
      relicSetExclusion,
      relicExclusion,
      useExcludedRelics,
      statFilters,
      mainStatKeys,
      optimizationTarget,
      mainStatAssumptionLevel,
      excludedLocations,
      allowLocationsState,
      allowPartial,
      maxBuildsToShow,
      plotBase,
      compareBuild,
      levelLow,
      levelHigh,
      useTeammateBuild,

      builds,
      buildDate,
    } = obj as OptConfig

    if (typeof statFilters !== 'object') statFilters = {}

    if (
      !mainStatKeys ||
      !mainStatKeys.body ||
      !mainStatKeys.feet ||
      !mainStatKeys.sphere ||
      !mainStatKeys.rope
    )
      mainStatKeys = deepClone(initialBuildSettings.mainStatKeys)
    else {
      // make sure the arrays are not empty
      ;(['body', 'feet', 'sphere', 'rope'] as const).forEach((sk) => {
        if (!mainStatKeys[sk].length)
          mainStatKeys[sk] = [...relicSlotToMainStatKeys[sk]]
      })
    }

    if (!optimizationTarget || !Array.isArray(optimizationTarget))
      optimizationTarget = undefined
    if (
      typeof mainStatAssumptionLevel !== 'number' ||
      mainStatAssumptionLevel < 0 ||
      mainStatAssumptionLevel > 15
    )
      mainStatAssumptionLevel = 0

    if (!relicExclusion || !Array.isArray(relicExclusion)) relicExclusion = []
    else
      relicExclusion = [...new Set(relicExclusion)].filter((id) =>
        this.database.relics.keys.includes(id)
      )

    excludedLocations = validateArr(
      excludedLocations,
      allCharacterLocationKeys.filter((k) => k !== key),
      [] // Remove self from list
    ).filter(
      (lk) =>
        this.database.chars.get(this.database.chars.LocationToCharacterKey(lk)) // Remove characters who do not exist in the DB
    )
    if (!allowLocationsState) allowLocationsState = 'unequippedOnly'

    if (
      !maxBuildsToShowList.includes(
        maxBuildsToShow as (typeof maxBuildsToShowList)[number]
      )
    )
      maxBuildsToShow = maxBuildsToShowDefault
    if (!plotBase || !Array.isArray(plotBase)) plotBase = undefined
    if (compareBuild === undefined) compareBuild = false
    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = 20
    if (!relicSetExclusion) relicSetExclusion = {}
    if (useExcludedRelics === undefined) useExcludedRelics = false
    if (!allowPartial) allowPartial = false
    relicSetExclusion = Object.fromEntries(
      Object.entries(relicSetExclusion as RelicSetExclusion)
        .map(([k, r]) => [k, [...new Set(r)]])
        .filter(([_, a]) => a.length)
    )
    if (typeof useTeammateBuild !== 'boolean') useTeammateBuild = false

    if (!Array.isArray(builds)) {
      builds = []
      buildDate = 0
    } else {
      builds = builds
        .map((build) => {
          if (typeof build !== 'object') return undefined
          const { lightConeId, relicIds: relicIdsRaw } = build as GeneratedBuild
          if (!this.database.lightCones.get(lightConeId)) return undefined
          const relicIds = objKeyMap(allRelicSlotKeys, (slotKey) =>
            this.database.relics.get(relicIdsRaw[slotKey])?.slotKey === slotKey
              ? relicIdsRaw[slotKey]
              : undefined
          )

          return { relicIds, lightConeId }
        })
        .filter((b) => b) as GeneratedBuild[]
      if (!Number.isInteger(buildDate)) buildDate = 0
    }

    return {
      relicSetExclusion,
      relicExclusion,
      useExcludedRelics,
      statFilters,
      mainStatKeys,
      optimizationTarget,
      mainStatAssumptionLevel,
      excludedLocations,
      allowLocationsState,
      allowPartial,
      maxBuildsToShow,
      plotBase,
      compareBuild,
      levelLow,
      levelHigh,
      useTeammateBuild,

      builds,
      buildDate,
    }
  }
  new(data: Partial<OptConfig> = {}) {
    const id = this.generateKey()
    this.set(id, { ...initialBuildSettings, ...data })
    return id
  }
  duplicate(optConfigId: string): string {
    const optConfig = this.get(optConfigId)
    if (!optConfig) return ''
    return this.new(structuredClone(optConfig))
  }
  export(optConfigId: string): object {
    const optConfig = this.database.optConfigs.get(optConfigId)
    if (!optConfig) return {}
    const {
      // remove user-specific data
      useExcludedRelics,
      excludedLocations,
      allowLocationsState,
      relicExclusion,
      buildDate,
      builds,
      ...rest
    } = optConfig
    return rest
  }
  import(data: object): string {
    const id = this.generateKey()
    if (!this.set(id, data)) return ''
    return id
  }
}

const initialBuildSettings: OptConfig = deepFreeze({
  relicSetExclusion: {},
  relicExclusion: [],
  useExcludedRelics: false,
  statFilters: {},
  mainStatKeys: {
    body: relicSlotToMainStatKeys.body,
    feet: relicSlotToMainStatKeys.feet,
    sphere: relicSlotToMainStatKeys.sphere,
    rope: relicSlotToMainStatKeys.rope,
  },
  optimizationTarget: undefined,
  mainStatAssumptionLevel: 0,
  excludedLocations: [],
  allowLocationsState: 'unequippedOnly',
  allowPartial: false,
  maxBuildsToShow: 5,
  plotBase: undefined,
  compareBuild: true,
  levelLow: 0,
  levelHigh: 15,
  useTeammateBuild: false,

  builds: [],
  buildDate: 0,
})

// TODO: Remove 4-set exclusion for planar relics
export function handleRelicSetExclusion(
  currentRelicSetExclusion: RelicSetExclusion,
  setKey: RelicSetExclusionKey,
  num: 2 | 4
) {
  const relicSetExclusion = deepClone(currentRelicSetExclusion)
  const setExclusion = relicSetExclusion[setKey]
  if (!setExclusion) relicSetExclusion[setKey] = [num]
  else if (!setExclusion.includes(num))
    relicSetExclusion[setKey] = [...setExclusion, num]
  else {
    relicSetExclusion[setKey] = setExclusion.filter((n) => n !== num)
    if (!setExclusion.length) delete relicSetExclusion[setKey]
  }
  return relicSetExclusion
}
