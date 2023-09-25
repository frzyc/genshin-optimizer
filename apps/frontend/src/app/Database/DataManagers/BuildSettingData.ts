import type {
  ArtifactSetKey,
  CharacterKey,
  LocationCharacterKey,
  MainStatKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allLocationCharacterKeys,
  artSlotsData,
} from '@genshin-optimizer/consts'
import { deepClone, deepFreeze, validateArr } from '@genshin-optimizer/util'
import { DataManager } from '../DataManager'
import type { ArtCharDatabase } from '../Database'

export const maxBuildsToShowList = [1, 2, 3, 4, 5, 8, 10] as const
export const maxBuildsToShowDefault = 5

export const allAllowLocationsState = [
  'unequippedOnly',
  'customList',
  'all',
] as const
export type AllowLocationsState = (typeof allAllowLocationsState)[number]

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
export type StatFilters = Dict<string, StatFilterSetting[]>
export interface BuildSetting {
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
  allowLocationsState: AllowLocationsState
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
}

export class BuildSettingDataManager extends DataManager<
  CharacterKey,
  'buildSettings',
  BuildSetting,
  BuildSetting,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'buildSettings')
    for (const key of this.database.storage.keys)
      if (
        key.startsWith('buildSetting_') &&
        !this.set(key.split('buildSetting_')[1] as CharacterKey, {})
      )
        this.database.storage.remove(key)
  }
  override toStorageKey(key: string): string {
    return `buildSetting_${key}`
  }
  override validate(obj: object, key: string): BuildSetting | undefined {
    if (!allCharacterKeys.includes(key as CharacterKey)) return undefined
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
      allowLocationsState,
      allowPartial,
      maxBuildsToShow,
      plotBase,
      compareBuild,
      levelLow,
      levelHigh,
    } = obj as BuildSetting

    if (typeof statFilters !== 'object') statFilters = {}

    if (
      !mainStatKeys ||
      !mainStatKeys.sands ||
      !mainStatKeys.goblet ||
      !mainStatKeys.circlet
    )
      mainStatKeys = deepClone(initialBuildSettings.mainStatKeys)
    else {
      // make sure the arrays are not empty
      ;(['sands', 'goblet', 'circlet'] as const).forEach((sk) => {
        if (!mainStatKeys[sk].length)
          mainStatKeys[sk] = [...artSlotsData[sk].stats]
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
    if (!artSetExclusion) artSetExclusion = {}
    if (useExcludedArts === undefined) useExcludedArts = false
    if (!allowPartial) allowPartial = false
    artSetExclusion = Object.fromEntries(
      Object.entries(artSetExclusion as ArtSetExclusion)
        .map(([k, a]) => [k, [...new Set(a)]])
        .filter(([_, a]) => a.length)
    )
    return {
      artSetExclusion,
      artExclusion,
      useExcludedArts,
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
    }
  }
  override get(key: CharacterKey) {
    return super.get(key) ?? initialBuildSettings
  }
}

const initialBuildSettings: BuildSetting = deepFreeze({
  artSetExclusion: {},
  artExclusion: [],
  useExcludedArts: false,
  statFilters: {},
  mainStatKeys: {
    sands: [...artSlotsData['sands'].stats],
    goblet: [...artSlotsData['goblet'].stats],
    circlet: [...artSlotsData['circlet'].stats],
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
  levelHigh: 20,
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
