import type { UnArray } from '@genshin-optimizer/common/util'
import { validateArr } from '@genshin-optimizer/common/util'
import type { SpecialityKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  allSpecialityKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  wengineMaxLevel,
  type DiscMainStatKey,
  type DiscSetKey,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'
import { validateTag } from '../tagUtil'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

export const allAllowLocationsState = [
  'unequippedOnly',
  'customList',
  'all',
] as const
export type AllowLocationsState = (typeof allAllowLocationsState)[number]
export type StatFilter = {
  tag: Tag
  value: number
  isMax: boolean
  disabled: boolean
}
export type StatFilters = Array<StatFilter>

export interface OptConfig {
  statFilters: StatFilters

  // Disc Filters
  levelLow: number
  levelHigh: number
  slot4: DiscMainStatKey[]
  slot5: DiscMainStatKey[]
  slot6: DiscMainStatKey[]
  setFilter2: DiscSetKey[]
  setFilter4: DiscSetKey[]
  useEquipped: boolean
  // excludedLocations: CharacterKey[]
  // allowLocationsState: AllowLocationsState
  // discExclusionIds: string[]

  // Wengine Filters
  optWengine: boolean
  wlevelLow: number
  wlevelHigh: number
  wEngineTypes: SpecialityKey[]
  useEquippedWengine: boolean

  //generated opt builds
  generatedBuildListId?: string
}

export class OptConfigDataManager extends DataManager<
  string,
  'optConfigs',
  OptConfig,
  OptConfig
> {
  constructor(database: ZzzDatabase) {
    super(database, 'optConfigs')
  }
  override validate(obj: object): OptConfig | undefined {
    if (typeof obj !== 'object') return undefined
    let {
      statFilters,

      levelLow,
      levelHigh,
      slot4,
      slot5,
      slot6,
      setFilter2,
      setFilter4,
      useEquipped,
      // excludedLocations,
      // allowLocationsState,
      // discExclusionIds,

      optWengine,
      wlevelLow,
      wlevelHigh,
      wEngineTypes,
      useEquippedWengine,

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

    setFilter2 = validateArr(setFilter2, allDiscSetKeys, [])
    setFilter4 = validateArr(setFilter4, allDiscSetKeys, [])
    slot4 = validateArr(slot4, discSlotToMainStatKeys['4'])
    slot5 = validateArr(slot5, discSlotToMainStatKeys['5'])
    slot6 = validateArr(slot6, discSlotToMainStatKeys['6'])

    // if (!discExclusionIds || !Array.isArray(discExclusionIds))
    //   discExclusionIds = []
    // else
    //   discExclusionIds = [...new Set(discExclusionIds)].filter((id) =>
    //     this.database.discs.keys.includes(id)
    //   )

    useEquipped = !!useEquipped
    // excludedLocations = validateArr(
    //   excludedLocations,
    //   allCharacterKeys,
    //   []
    // ).filter(
    //   (ck) => this.database.chars.get(ck) // Remove characters who do not exist in the DB
    // )
    // if (!allowLocationsState) allowLocationsState = 'unequippedOnly'

    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = discMaxLevel['S']

    optWengine = !!optWengine
    if (wlevelLow === undefined) wlevelLow = 0
    if (wlevelHigh === undefined) wlevelHigh = wengineMaxLevel
    wEngineTypes = validateArr(wEngineTypes, allSpecialityKeys, [])

    useEquippedWengine = !!useEquippedWengine

    if (
      generatedBuildListId &&
      !this.database.generatedBuildList.get(generatedBuildListId)
    )
      generatedBuildListId = undefined

    return {
      statFilters,

      levelLow,
      levelHigh,
      slot4,
      slot5,
      slot6,
      setFilter2,
      setFilter4,
      useEquipped,
      // excludedLocations,
      // allowLocationsState,
      // discExclusionIds,

      optWengine,
      wlevelLow,
      wlevelHigh,
      wEngineTypes,
      useEquippedWengine,

      generatedBuildListId,
    }
  }
  new(data: Partial<OptConfig> = {}) {
    const id = this.generateKey()
    this.set(id, { ...initialOptConfig(), ...data })
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
      useEquipped,
      useEquippedWengine,
      // excludedLocations,
      // allowLocationsState,
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

function initialOptConfig(): OptConfig {
  return {
    statFilters: [],

    levelLow: discMaxLevel['S'],
    levelHigh: discMaxLevel['S'],
    slot4: [...discSlotToMainStatKeys['4']],
    slot5: [...discSlotToMainStatKeys['5']],
    slot6: [...discSlotToMainStatKeys['6']],
    setFilter2: [],
    setFilter4: [],
    useEquipped: false,
    // discExclusionIds: [],
    // excludedLocations: [],
    // allowLocationsState: 'unequippedOnly',

    optWengine: false,
    wlevelLow: wengineMaxLevel,
    wlevelHigh: wengineMaxLevel,
    wEngineTypes: [],
    useEquippedWengine: false,

    generatedBuildListId: undefined,
  }
}
