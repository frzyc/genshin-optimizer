import {
  clamp,
  deepClone,
  deepFreeze,
  validateArr,
} from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  LocationCharacterKey,
  MainStatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allLocationCharacterKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

export const maxBuildsToShowList = [1, 2, 3, 4, 5, 8, 10] as const
export const maxBuildsToShowDefault = 5

export const allArtifactSetExclusionKeys = [
  ...allArtifactSetKeys.filter(
    (key) =>
      ![
        'PrayersForDestiny',
        'PrayersForIllumination',
        'PrayersForWisdom',
        'PrayersToSpringtime',
      ].includes(key)
  ),
  'rainbow',
] as ArtSetExclusionKey[]

export type ArtSetExclusionKey =
  | Exclude<
      ArtifactSetKey,
      | 'PrayersForDestiny'
      | 'PrayersForIllumination'
      | 'PrayersForWisdom'
      | 'PrayersToSpringtime'
    >
  | 'rainbow'
export type ArtSetExclusion = Partial<Record<ArtSetExclusionKey, (2 | 4)[]>>

export interface StatFilterSetting {
  value: number
  disabled: boolean
}
export type StatFilters = Record<string, StatFilterSetting[]>

export interface OptConfig {
  artSetExclusion: ArtSetExclusion
  statFilters: StatFilters
  mainStatKeys: {
    sands: MainStatKey[]
    goblet: MainStatKey[]
    circlet: MainStatKey[]
    flower?: never
    plume?: never
  }
  excludedLocations: LocationCharacterKey[]
  artExclusion: string[]
  useExcludedArts: boolean
  optimizationTarget?: string[]
  mainStatAssumptionLevel: number
  allowPartial: boolean
  maxBuildsToShow: number
  plotBase?: string[]
  compareBuild: boolean
  levelLow: number
  levelHigh: number
  useTeammateBuild: boolean // teammates loadout exclusion flag

  //generated opt builds
  generatedBuildListId?: string

  // upOpt
  upOptLevelLow: number
  upOptLevelHigh: number
}

export class OptConfigDataManager extends DataManager<
  string,
  'optConfigs',
  OptConfig,
  OptConfig,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'optConfigs')
    for (const key of this.database.storage.keys)
      if (key.startsWith('optConfig_') && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: object, key: string): OptConfig | undefined {
    if (typeof obj !== 'object') return undefined
    let {
      artSetExclusion,
      artExclusion,
      useExcludedArts,
      statFilters,
      mainStatKeys,
      optimizationTarget,
      mainStatAssumptionLevel,
      excludedLocations,
      allowPartial,
      maxBuildsToShow,
      plotBase,
      compareBuild,
      levelLow,
      levelHigh,
      generatedBuildListId,
      useTeammateBuild,
      upOptLevelLow,
      upOptLevelHigh,
    } = obj as OptConfig

    if (typeof statFilters !== 'object') statFilters = {}

    if (
      !mainStatKeys ||
      !mainStatKeys.sands ||
      !mainStatKeys.goblet ||
      !mainStatKeys.circlet
    )
      mainStatKeys = deepClone(initialBuildSettings.mainStatKeys)
    else {
      const slots = ['sands', 'goblet', 'circlet'] as const
      // make sure the arrays are not empty
      slots.forEach((sk) => {
        if (!mainStatKeys[sk].length)
          mainStatKeys[sk] = [...artSlotMainKeys[sk]]
      })
    }

    if (!optimizationTarget || !Array.isArray(optimizationTarget))
      optimizationTarget = undefined
    if (
      typeof mainStatAssumptionLevel !== 'number' ||
      mainStatAssumptionLevel < 0 ||
      mainStatAssumptionLevel > 20
    )
      mainStatAssumptionLevel = 0

    if (!artExclusion || !Array.isArray(artExclusion)) artExclusion = []
    else
      artExclusion = [...new Set(artExclusion)].filter((id) =>
        this.database.arts.keys.includes(id)
      )

    excludedLocations = validateArr(
      excludedLocations,
      allLocationCharacterKeys.filter((k) => k !== key),
      [] // Remove self from list
    ).filter(
      (lk) =>
        this.database.chars.get(this.database.chars.LocationToCharacterKey(lk)) // Remove characters who do not exist in the DB
    )

    if (
      !maxBuildsToShowList.includes(
        maxBuildsToShow as (typeof maxBuildsToShowList)[number]
      )
    )
      maxBuildsToShow = maxBuildsToShowDefault
    if (!plotBase || !Array.isArray(plotBase)) plotBase = undefined
    if (compareBuild === undefined) compareBuild = false

    if (typeof levelLow !== 'number') levelLow = 0
    if (typeof levelHigh !== 'number') levelHigh = 20
    levelLow = clamp(levelLow, 0, 20)
    levelHigh = clamp(levelHigh, 0, 20)
    levelLow = clamp(levelLow, levelLow, levelHigh)
    levelHigh = clamp(levelHigh, levelLow, levelHigh)

    if (typeof upOptLevelLow !== 'number') upOptLevelLow = 0
    if (typeof upOptLevelHigh !== 'number') upOptLevelHigh = 19
    upOptLevelLow = clamp(upOptLevelLow, 0, 20)
    upOptLevelHigh = clamp(upOptLevelHigh, 0, 20)
    upOptLevelLow = clamp(upOptLevelLow, upOptLevelLow, upOptLevelHigh)
    upOptLevelHigh = clamp(upOptLevelHigh, upOptLevelLow, upOptLevelHigh)

    if (!artSetExclusion) artSetExclusion = {}
    if (useExcludedArts === undefined) useExcludedArts = false
    if (!allowPartial) allowPartial = false
    artSetExclusion = Object.fromEntries(
      Object.entries(artSetExclusion as ArtSetExclusion)
        .map(([k, a]) => [k, [...new Set(a)]])
        .filter(([_, a]) => a.length)
    )

    if (
      generatedBuildListId &&
      !this.database.generatedBuildList.get(generatedBuildListId)
    )
      generatedBuildListId = undefined
    if (typeof useTeammateBuild !== 'boolean') useTeammateBuild = false

    return {
      artSetExclusion,
      artExclusion,
      useExcludedArts,
      statFilters,
      mainStatKeys,
      optimizationTarget,
      mainStatAssumptionLevel,
      excludedLocations,
      allowPartial,
      maxBuildsToShow,
      plotBase,
      compareBuild,
      levelLow,
      levelHigh,
      generatedBuildListId,
      useTeammateBuild,
      upOptLevelLow,
      upOptLevelHigh,
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
  export(optConfigId: string, overrideOptTarget?: string[]): object {
    const optConfig = this.database.optConfigs.get(optConfigId)
    if (!optConfig) return {}
    const {
      // remove user-specific data
      useExcludedArts,
      excludedLocations,
      artExclusion,
      generatedBuildListId,
      ...rest
    } = optConfig
    if (!overrideOptTarget) return rest
    return {
      ...rest,
      optimizationTarget: overrideOptTarget,
    }
  }
  import(data: object): string {
    const id = this.generateKey()
    if (!this.set(id, data)) return ''
    return id
  }
  newOrSetGeneratedBuildList(optConfigId: string, list: GeneratedBuildList) {
    const optConfig = this.get(optConfigId)

    if (!optConfig) {
      console.warn(`OptConfig not found for ID: ${optConfigId}`)
      return false
    }

    const listId = optConfig.generatedBuildListId
    const generatedBuildList =
      listId && this.database.generatedBuildList.get(listId)

    if (listId && generatedBuildList) {
      return this.database.generatedBuildList.set(listId, list)
    } else {
      return this.database.optConfigs.set(optConfigId, {
        generatedBuildListId: this.database.generatedBuildList.new(list),
      })
    }
  }
}

const initialBuildSettings: OptConfig = deepFreeze({
  artSetExclusion: {},
  artExclusion: [],
  useExcludedArts: false,
  statFilters: {},
  mainStatKeys: {
    sands: [...artSlotMainKeys['sands']],
    goblet: [...artSlotMainKeys['goblet']],
    circlet: [...artSlotMainKeys['circlet']],
  },
  optimizationTarget: undefined,
  mainStatAssumptionLevel: 0,
  excludedLocations: [],
  allowPartial: false,
  maxBuildsToShow: 5,
  plotBase: undefined,
  compareBuild: true,
  levelLow: 0,
  levelHigh: 20,
  useTeammateBuild: false,
  upOptLevelLow: 0,
  upOptLevelHigh: 19,
  generatedBuildListId: undefined
})

export function handleArtSetExclusion(
  currentArtSetExclusion: ArtSetExclusion,
  setKey: ArtSetExclusionKey,
  num: 2 | 4
) {
  const artSetExclusion = deepClone(currentArtSetExclusion)
  const setExclusion = artSetExclusion[setKey]
  if (!setExclusion) artSetExclusion[setKey] = [num]
  else if (!setExclusion.includes(num))
    artSetExclusion[setKey] = [...setExclusion, num]
  else {
    artSetExclusion[setKey] = setExclusion.filter((n) => n !== num)
    if (!setExclusion.length) delete artSetExclusion[setKey]
  }
  return artSetExclusion
}
