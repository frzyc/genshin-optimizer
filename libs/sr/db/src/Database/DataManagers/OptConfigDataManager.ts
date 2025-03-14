import type { UnArray } from '@genshin-optimizer/common/util'
import { deepFreeze, validateArr } from '@genshin-optimizer/common/util'
import type {
  PathKey,
  RelicCavernSetKey,
  RelicMainStatKey,
  RelicPlanarSetKey,
} from '@genshin-optimizer/sr/consts'
import {
  allPathKeys,
  allRelicCavernSetKeys,
  allRelicPlanarSetKeys,
  lightConeMaxLevel,
  relicMaxLevel,
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

export type StatFilter = {
  tag: Tag
  value: number
  isMax: boolean
  disabled: boolean
}
export type StatFilters = Array<StatFilter>

export interface OptConfig {
  statFilters: StatFilters

  // Relic filters
  levelLow: number
  levelHigh: number
  slotBodyKeys: RelicMainStatKey[]
  slotFeetKeys: RelicMainStatKey[]
  slotSphereKeys: RelicMainStatKey[]
  slotRopeKeys: RelicMainStatKey[]
  setFilter2Cavern: RelicCavernSetKey[]
  setFilter4Cavern: RelicCavernSetKey[]
  setFilter2Planar: RelicPlanarSetKey[]
  useEquipped: boolean

  // excludedLocations: CharacterKey[]
  // allowLocationsState: AllowLocationsState
  // relicExclusion: string[]
  // useExcludedRelics: boolean
  // allowPartial: boolean

  // LC Filters
  optLightCone: boolean
  lcLevelLow: number
  lcLevelHigh: number
  lightConePaths: PathKey[]
  useEquippedLightCone: boolean

  //generated opt builds
  maxBuildsToShow: number
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
      statFilters,

      levelLow,
      levelHigh,
      slotBodyKeys,
      slotFeetKeys,
      slotSphereKeys,
      slotRopeKeys,
      setFilter2Cavern,
      setFilter4Cavern,
      setFilter2Planar,
      useEquipped,
      // relicExclusion,
      // useExcludedRelics,
      // excludedLocations,
      // allowLocationsState,
      // allowPartial,

      optLightCone,
      lcLevelLow,
      lcLevelHigh,
      lightConePaths,
      useEquippedLightCone,

      maxBuildsToShow,
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

    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = relicMaxLevel['5']

    slotBodyKeys = validateArr(slotBodyKeys, relicSlotToMainStatKeys.body, [])
    slotFeetKeys = validateArr(slotFeetKeys, relicSlotToMainStatKeys.feet, [])
    slotSphereKeys = validateArr(
      slotSphereKeys,
      relicSlotToMainStatKeys.sphere,
      [],
    )
    slotRopeKeys = validateArr(slotRopeKeys, relicSlotToMainStatKeys.rope, [])
    setFilter2Cavern = validateArr(setFilter2Cavern, allRelicCavernSetKeys, [])
    setFilter4Cavern = validateArr(setFilter4Cavern, allRelicCavernSetKeys, [])
    setFilter2Planar = validateArr(setFilter2Planar, allRelicPlanarSetKeys, [])
    useEquipped = !!useEquipped

    // if (!relicExclusion || !Array.isArray(relicExclusion)) relicExclusion = []
    // else
    //   relicExclusion = [...new Set(relicExclusion)].filter((id) =>
    //     this.database.relics.keys.includes(id)
    //   )

    // excludedLocations = validateArr(
    //   excludedLocations,
    //   allCharacterKeys,
    //   []
    // ).filter(
    //   (ck) => this.database.chars.get(ck) // Remove characters who do not exist in the DB
    // )
    // if (!allowLocationsState) allowLocationsState = 'unequippedOnly'

    optLightCone = !!optLightCone
    if (lcLevelLow === undefined) lcLevelLow = 0
    if (lcLevelHigh === undefined) lcLevelHigh = lightConeMaxLevel
    lightConePaths = validateArr(lightConePaths, allPathKeys, [])
    useEquippedLightCone = !!useEquippedLightCone

    if (
      !maxBuildsToShowList.includes(
        maxBuildsToShow as (typeof maxBuildsToShowList)[number],
      )
    )
      maxBuildsToShow = maxBuildsToShowDefault
    // if (!plotBase || !Array.isArray(plotBase)) plotBase = undefined

    if (
      generatedBuildListId &&
      !this.database.generatedBuildList.get(generatedBuildListId)
    )
      generatedBuildListId = undefined

    return {
      statFilters,

      levelLow,
      levelHigh,
      slotBodyKeys,
      slotFeetKeys,
      slotSphereKeys,
      slotRopeKeys,
      setFilter2Cavern,
      setFilter4Cavern,
      setFilter2Planar,
      useEquipped,
      // relicExclusion,
      // useExcludedRelics,
      // excludedLocations,
      // allowLocationsState,
      // allowPartial,

      optLightCone,
      lcLevelLow,
      lcLevelHigh,
      lightConePaths,
      useEquippedLightCone,

      maxBuildsToShow,
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
      // useExcludedRelics,
      // excludedLocations,
      // allowLocationsState,
      // relicExclusion,
      useEquipped,
      useEquippedLightCone: useEquippedLC,
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
  statFilters: [],

  levelLow: relicMaxLevel['5'],
  levelHigh: relicMaxLevel['5'],
  slotBodyKeys: [...relicSlotToMainStatKeys.body],
  slotFeetKeys: [...relicSlotToMainStatKeys.feet],
  slotSphereKeys: [...relicSlotToMainStatKeys.sphere],
  slotRopeKeys: [...relicSlotToMainStatKeys.rope],
  setFilter2Cavern: [],
  setFilter4Cavern: [],
  setFilter2Planar: [],
  useEquipped: false,

  optLightCone: false,
  lcLevelLow: lightConeMaxLevel,
  lcLevelHigh: lightConeMaxLevel,
  lightConePaths: [],
  useEquippedLightCone: false,

  maxBuildsToShow: 5,
})
