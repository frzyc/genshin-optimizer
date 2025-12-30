import {
  zodBoolean,
  zodFilteredArray,
  zodNumericLiteralWithDefault,
} from '@genshin-optimizer/common/database'
import { deepFreeze } from '@genshin-optimizer/common/util'
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
import { z } from 'zod'
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

const statFilterSchema = z.object({
  tag: z.record(z.string(), z.unknown()) as z.ZodType<Tag>,
  value: z.number(),
  isMax: z.boolean(),
  disabled: z.boolean(),
})

export type StatFilter = z.infer<typeof statFilterSchema>
export type StatFilters = StatFilter[]

const optConfigSchema = z.object({
  statFilters: z.array(statFilterSchema).catch([]),

  levelLow: z.number().int().min(0).max(15).catch(relicMaxLevel['5']),
  levelHigh: z.number().int().min(0).max(15).catch(relicMaxLevel['5']),
  slotBodyKeys: zodFilteredArray(relicSlotToMainStatKeys.body, []),
  slotFeetKeys: zodFilteredArray(relicSlotToMainStatKeys.feet, []),
  slotSphereKeys: zodFilteredArray(relicSlotToMainStatKeys.sphere, []),
  slotRopeKeys: zodFilteredArray(relicSlotToMainStatKeys.rope, []),
  setFilter2Cavern: zodFilteredArray(allRelicCavernSetKeys, []),
  setFilter4Cavern: zodFilteredArray(allRelicCavernSetKeys, []),
  setFilter2Planar: zodFilteredArray(allRelicPlanarSetKeys, []),
  useEquipped: zodBoolean(),

  optLightCone: zodBoolean(),
  lcLevelLow: z.number().int().min(0).max(80).catch(lightConeMaxLevel),
  lcLevelHigh: z.number().int().min(0).max(80).catch(lightConeMaxLevel),
  lightConePaths: zodFilteredArray(allPathKeys, []),
  useEquippedLightCone: zodBoolean(),

  maxBuildsToShow: zodNumericLiteralWithDefault(
    maxBuildsToShowList,
    maxBuildsToShowDefault
  ),
  generatedBuildListId: z.string().optional(),
})

export type OptConfig = z.infer<typeof optConfigSchema>

export class OptConfigDataManager extends DataManager<
  string,
  'optConfigs',
  OptConfig,
  OptConfig
> {
  constructor(database: SroDatabase) {
    super(database, 'optConfigs')
  }
  override validate(obj: unknown): OptConfig | undefined {
    const result = optConfigSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      statFilters: rawStatFilters,
      generatedBuildListId: rawGeneratedBuildListId,
      ...rest
    } = result.data

    // Filter statFilters with business logic (validateTag)
    const statFilters = rawStatFilters.filter((statFilter) =>
      validateTag(statFilter.tag as Tag)
    )

    // Validate generatedBuildListId exists in database
    const generatedBuildListId =
      rawGeneratedBuildListId &&
      this.database.generatedBuildList.get(rawGeneratedBuildListId)
        ? rawGeneratedBuildListId
        : undefined

    return {
      ...rest,
      statFilters,
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
      })
  }
}

const initialBuildSettings: OptConfig = deepFreeze({
  statFilters: [],

  levelLow: relicMaxLevel['5'],
  levelHigh: relicMaxLevel['5'],
  slotBodyKeys: [...relicSlotToMainStatKeys.body] as RelicMainStatKey[],
  slotFeetKeys: [...relicSlotToMainStatKeys.feet] as RelicMainStatKey[],
  slotSphereKeys: [...relicSlotToMainStatKeys.sphere] as RelicMainStatKey[],
  slotRopeKeys: [...relicSlotToMainStatKeys.rope] as RelicMainStatKey[],
  setFilter2Cavern: [] as RelicCavernSetKey[],
  setFilter4Cavern: [] as RelicCavernSetKey[],
  setFilter2Planar: [] as RelicPlanarSetKey[],
  useEquipped: false,

  optLightCone: false,
  lcLevelLow: lightConeMaxLevel,
  lcLevelHigh: lightConeMaxLevel,
  lightConePaths: [] as PathKey[],
  useEquippedLightCone: false,

  maxBuildsToShow: 5,
})
