import {
  zodBoolean,
  zodFilteredArray,
  zodNumericLiteralWithDefault,
} from '@genshin-optimizer/common/database'
import {
  removeUndefinedFields,
  validateValue,
} from '@genshin-optimizer/common/util'
import type { AttributeKey, SpecialityKey } from '@genshin-optimizer/zzz/consts'
import {
  type DiscMainStatKey,
  type DiscSetKey,
  allAttributeKeys,
  allDiscSetKeys,
  allSpecialityKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { z } from 'zod'
import type { ZzzDatabase } from '../..'
import { DataManager } from '../DataManager'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

export const maxBuildsToShowList = [1, 2, 3, 5, 10] as const
export const maxBuildsToShowDefault = 5

export const statFilterStatKeys = [
  'hp',
  'def',
  'atk',
  'dmg_',
  'enerRegen_',
  'enerRegen',
  'crit_',
  'crit_dmg_',
  'pen',
  'pen_',
  'anomProf',
  'anomMas',
  'impact',
  'dazeInc_',
  'sheerForce',
] as const
export type StatFilterStatKey = (typeof statFilterStatKeys)[number]
export const statFilterStatQtKeys = ['final', 'combat', 'initial'] as const

export const allAllowLocationsState = [
  'unequippedOnly',
  'customList',
  'all',
] as const
export type AllowLocationsState = (typeof allAllowLocationsState)[number]
export type StatFilterTag = {
  q: StatFilterStatKey
  qt?: (typeof statFilterStatQtKeys)[number]
  attribute?: AttributeKey
}

const statFilterTagSchema = z.object({
  q: z.string(),
  qt: z.string().optional(),
  attribute: z.string().optional(),
}) as z.ZodType<StatFilterTag>

const statFilterSchema = z.object({
  tag: statFilterTagSchema,
  value: z.number().catch(0),
  isMax: zodBoolean(),
  disabled: zodBoolean(),
})

export type StatFilter = z.infer<typeof statFilterSchema>
export type StatFilters = StatFilter[]

const optConfigSchema = z.object({
  statFilters: z.array(statFilterSchema).catch([]),
  maxBuildsToShow: zodNumericLiteralWithDefault(
    maxBuildsToShowList,
    maxBuildsToShowDefault
  ),

  levelLow: z.number().int().min(0).max(15).catch(discMaxLevel['S']),
  levelHigh: z.number().int().min(0).max(15).catch(discMaxLevel['S']),
  slot4: zodFilteredArray(discSlotToMainStatKeys['4'], [
    ...discSlotToMainStatKeys['4'],
  ]) as z.ZodType<DiscMainStatKey[]>,
  slot5: zodFilteredArray(discSlotToMainStatKeys['5'], [
    ...discSlotToMainStatKeys['5'],
  ]) as z.ZodType<DiscMainStatKey[]>,
  slot6: zodFilteredArray(discSlotToMainStatKeys['6'], [
    ...discSlotToMainStatKeys['6'],
  ]) as z.ZodType<DiscMainStatKey[]>,
  setFilter2: zodFilteredArray(allDiscSetKeys, []) as z.ZodType<DiscSetKey[]>,
  setFilter4: zodFilteredArray(allDiscSetKeys, []) as z.ZodType<DiscSetKey[]>,
  useEquipped: zodBoolean(),

  optWengine: zodBoolean(),
  wlevelLow: z.number().int().min(0).max(60).catch(wengineMaxLevel),
  wlevelHigh: z.number().int().min(0).max(60).catch(wengineMaxLevel),
  wEngineTypes: zodFilteredArray(allSpecialityKeys, []) as z.ZodType<
    SpecialityKey[]
  >,
  useEquippedWengine: zodBoolean(),

  generatedBuildListId: z.string().optional(),
})

export type OptConfig = z.infer<typeof optConfigSchema>

export class OptConfigDataManager extends DataManager<
  string,
  'optConfigs',
  OptConfig,
  OptConfig
> {
  constructor(database: ZzzDatabase) {
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

    // Validate statFilters with business logic
    const statFilters = rawStatFilters.map((statFilter) => {
      const { tag, value, isMax, disabled } = statFilter
      const q =
        validateValue(tag.q, statFilterStatKeys) ?? statFilterStatKeys[0]
      const qt =
        validateValue(tag.qt, statFilterStatQtKeys) ?? statFilterStatQtKeys[0]
      let attribute = tag.attribute
      if (q !== 'dmg_') attribute = undefined
      if (attribute) attribute = validateValue(attribute, allAttributeKeys)

      return {
        tag: removeUndefinedFields({ q, qt, attribute }) as StatFilterTag,
        value,
        isMax,
        disabled,
      }
    })

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
    const { useEquipped, useEquippedWengine, generatedBuildListId, ...rest } =
      optConfig
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

const initialOptConfig = (): OptConfig => optConfigSchema.parse({})

export function newStatFilterTag(q: StatFilterStatKey): StatFilterTag {
  return {
    q,
    qt: 'final',
  }
}

export function StatFilterTagToTag(tag: StatFilterTag): Tag {
  return {
    ...tag,
    et: 'own',
    sheet: 'agg',
  }
}
