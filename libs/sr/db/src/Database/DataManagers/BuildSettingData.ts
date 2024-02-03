import {
  deepClone,
  deepFreeze,
  validateArr,
} from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  CharacterLocationKey,
  RelicMainStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allCharacterLocationKeys,
  allRelicSetKeys,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'

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
export interface BuildSetting {
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
}

export class BuildSettingDataManager extends SroDataManager<
  CharacterKey,
  'buildSettings',
  BuildSetting,
  BuildSetting
> {
  constructor(database: SroDatabase) {
    super(database, 'buildSettings')
  }
  override validate(obj: object, key: string): BuildSetting | undefined {
    if (!allCharacterKeys.includes(key as CharacterKey)) return undefined
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
    } = obj as BuildSetting

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
    }
  }
  override get(key: CharacterKey) {
    return super.get(key) ?? initialBuildSettings
  }
}

const initialBuildSettings: BuildSetting = deepFreeze({
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
  levelHigh: 20,
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
