import type { UnArray } from '@genshin-optimizer/common/util'
import {
  deepClone,
  deepFreeze,
  validateArr,
} from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  RelicMainStatKey,
} from '@genshin-optimizer/sr/consts'
import {
  allCharacterKeys,
  allRelicSetKeys,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import { validateTag } from '../tagUtil'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

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

export type StatFilter = {
  tag: Tag
  value: number
  isMax: boolean
  disabled: boolean
}
export type StatFilters = Array<StatFilter>

export interface OptConfig {
  relicSetExclusion: RelicSetExclusion
  statFilters: StatFilters
  mainStatKeys: {
    body: RelicMainStatKey[]
    feet: RelicMainStatKey[]
    sphere: RelicMainStatKey[]
    rope: RelicMainStatKey[]
    head?: never
    hands?: never
  }
  excludedLocations: CharacterKey[]
  allowLocationsState: AllowLocationsState
  relicExclusion: string[]
  useExcludedRelics: boolean
  mainStatAssumptionLevel: number
  allowPartial: boolean
  maxBuildsToShow: number
  plotBase?: string[]
  compareBuild: boolean
  levelLow: number
  levelHigh: number
  useTeammateBuild: boolean

  //generated opt builds
  generatedBuildListId?: string
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
  override validate(obj: object): OptConfig | undefined {
    if (typeof obj !== 'object') return undefined
    let {
      relicSetExclusion,
      relicExclusion,
      useExcludedRelics,
      statFilters,
      mainStatKeys,
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

      generatedBuildListId,
    } = obj as OptConfig

    if (!Array.isArray(statFilters)) statFilters = []
    statFilters = statFilters.filter((statFilter) => {
      const { tag, value, isMax, disabled } = statFilter as UnArray<StatFilters>
      if (!validateTag(tag)) return false
      if (typeof value !== 'number') return false
      if (typeof isMax !== 'boolean') return false
      if (typeof disabled !== 'boolean') return false
      return true
    })

    if (
      !mainStatKeys ||
      !mainStatKeys.body ||
      !mainStatKeys.feet ||
      !mainStatKeys.sphere ||
      !mainStatKeys.rope
    )
      mainStatKeys = deepClone(initialBuildSettings.mainStatKeys)
    else {
      const slots = ['body', 'feet', 'sphere', 'rope'] as const
      // make sure the arrays are not empty
      slots.forEach((sk) => {
        if (!mainStatKeys[sk].length)
          mainStatKeys[sk] = [...relicSlotToMainStatKeys[sk]]
      })
    }

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
      allCharacterKeys,
      []
    ).filter(
      (ck) => this.database.chars.get(ck) // Remove characters who do not exist in the DB
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

    if (
      generatedBuildListId &&
      !this.database.generatedBuildList.get(generatedBuildListId)
    )
      generatedBuildListId = undefined

    return {
      relicSetExclusion,
      relicExclusion,
      useExcludedRelics,
      statFilters,
      mainStatKeys,
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

      generatedBuildListId,
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
      generatedBuildListId,
      ...rest
    } = optConfig
    return rest
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
    if (listId && generatedBuildList)
      return this.database.generatedBuildList.set(listId, list)
    else
      return this.database.optConfigs.set(optConfigId, {
        generatedBuildListId: this.database.generatedBuildList.new(list),
      }) // Create a new list
  }
}

const initialBuildSettings: OptConfig = deepFreeze({
  relicSetExclusion: {},
  relicExclusion: [],
  useExcludedRelics: false,
  statFilters: [],
  mainStatKeys: {
    body: relicSlotToMainStatKeys.body,
    feet: relicSlotToMainStatKeys.feet,
    sphere: relicSlotToMainStatKeys.sphere,
    rope: relicSlotToMainStatKeys.rope,
  },
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
