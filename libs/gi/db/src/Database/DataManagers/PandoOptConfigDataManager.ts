import {
  zodBoolean,
  zodFilteredArray,
  zodNumericLiteralWithDefault,
} from '@genshin-optimizer/common/database'
import {
  removeUndefinedFields,
  validateValue,
} from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  ElementWithPhyKey,
  MainStatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allElementWithPhyKeys,
  artSlotMainKeys,
  defaultOptArtifactLevel,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { PandoGeneratedBuildList } from './PandoGeneratedBuildListDataManager'

export const pandoMaxBuildsToShowList = [1, 2, 3, 5, 10] as const
export const pandoMaxBuildsToShowDefault = 5

export const pandoStatFilterStatKeys = [
  'hp',
  'atk',
  'def',
  'hp_',
  'atk_',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
  'dmg_',
] as const
export type PandoStatFilterStatKey = (typeof pandoStatFilterStatKeys)[number]
export const pandoStatFilterStatQtKeys = ['final', 'premod', 'base'] as const
export type PandoStatFilterStatQtKey =
  (typeof pandoStatFilterStatQtKeys)[number]

export type PandoStatFilterTag = {
  q: PandoStatFilterStatKey
  qt?: PandoStatFilterStatQtKey
  ele?: ElementWithPhyKey
}

const statFilterTagSchema = z.object({
  q: z.string(),
  qt: z.string().optional(),
  ele: z.string().optional(),
}) as z.ZodType<PandoStatFilterTag>

const statFilterSchema = z.object({
  tag: statFilterTagSchema,
  value: z.number().catch(0),
  isMax: zodBoolean(),
  disabled: zodBoolean(),
})

export type PandoStatFilter = z.infer<typeof statFilterSchema>
export type PandoStatFilters = PandoStatFilter[]

const pandoOptConfigSchema = z.object({
  statFilters: z.array(statFilterSchema).catch([]),
  maxBuildsToShow: zodNumericLiteralWithDefault(
    pandoMaxBuildsToShowList,
    pandoMaxBuildsToShowDefault
  ),

  levelLow: z.number().int().min(0).max(20).catch(0),
  levelHigh: z.number().int().min(0).max(20).catch(defaultOptArtifactLevel),
  sands: zodFilteredArray(artSlotMainKeys.sands, [
    ...artSlotMainKeys.sands,
  ]) as z.ZodType<MainStatKey[]>,
  goblet: zodFilteredArray(artSlotMainKeys.goblet, [
    ...artSlotMainKeys.goblet,
  ]) as z.ZodType<MainStatKey[]>,
  circlet: zodFilteredArray(artSlotMainKeys.circlet, [
    ...artSlotMainKeys.circlet,
  ]) as z.ZodType<MainStatKey[]>,
  setFilter2: zodFilteredArray(allArtifactSetKeys, []) as z.ZodType<
    ArtifactSetKey[]
  >,
  setFilter4: zodFilteredArray(allArtifactSetKeys, []) as z.ZodType<
    ArtifactSetKey[]
  >,
  allowRainbow: zodBoolean(true),
  useEquipped: zodBoolean(),

  optWeapon: zodBoolean(),
  wlevelLow: z.number().int().min(0).max(90).catch(0),
  wlevelHigh: z.number().int().min(0).max(90).catch(90),
  useEquippedWeapon: zodBoolean(),

  generatedBuildListId: z.string().optional(),
})

export type PandoOptConfig = z.infer<typeof pandoOptConfigSchema>

const storageHash = 'pandoOptConfig_'

export class PandoOptConfigDataManager extends DataManager<
  string,
  'pandoOptConfigs',
  PandoOptConfig,
  PandoOptConfig,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'pandoOptConfigs')
    for (const key of this.database.storage.keys)
      if (key.startsWith(storageHash) && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  override validate(obj: unknown): PandoOptConfig | undefined {
    const result = pandoOptConfigSchema.safeParse(obj)
    if (!result.success) return undefined

    const {
      statFilters: rawStatFilters,
      generatedBuildListId: rawGeneratedBuildListId,
      sands,
      goblet,
      circlet,
      ...rest
    } = result.data

    const statFilters = rawStatFilters.map((statFilter) => {
      const { tag, value, isMax, disabled } = statFilter
      const q =
        validateValue(tag.q, pandoStatFilterStatKeys) ??
        pandoStatFilterStatKeys[0]
      const qt =
        validateValue(tag.qt, pandoStatFilterStatQtKeys) ??
        pandoStatFilterStatQtKeys[0]
      let ele = tag.ele
      if (q !== 'dmg_') ele = undefined
      if (ele) ele = validateValue(ele, allElementWithPhyKeys)

      return {
        tag: removeUndefinedFields({ q, qt, ele }) as PandoStatFilterTag,
        value,
        isMax,
        disabled,
      }
    })

    const generatedBuildListId =
      rawGeneratedBuildListId &&
      this.database.pandoGeneratedBuildList.get(rawGeneratedBuildListId)
        ? rawGeneratedBuildListId
        : undefined

    return {
      ...rest,
      sands: sands.length ? sands : [...artSlotMainKeys.sands],
      goblet: goblet.length ? goblet : [...artSlotMainKeys.goblet],
      circlet: circlet.length ? circlet : [...artSlotMainKeys.circlet],
      statFilters,
      generatedBuildListId,
    }
  }
  new(data: Partial<PandoOptConfig> = {}) {
    const id = this.generateKey()
    this.set(id, { ...initialPandoOptConfig(), ...data })
    return id
  }
  newOrSetGeneratedBuildList(
    optConfigId: string,
    list: PandoGeneratedBuildList
  ) {
    const optConfig = this.get(optConfigId)
    if (!optConfig) {
      console.warn(`PandoOptConfig not found for ID: ${optConfigId}`)
      return false
    }
    const listId = optConfig.generatedBuildListId
    const generatedBuildList =
      listId && this.database.pandoGeneratedBuildList.get(listId)
    if (listId && generatedBuildList)
      return this.database.pandoGeneratedBuildList.set(listId, list)
    return this.set(optConfigId, {
      generatedBuildListId: this.database.pandoGeneratedBuildList.new(list),
    })
  }
}

const initialPandoOptConfig = (): PandoOptConfig =>
  pandoOptConfigSchema.parse({})

export function newPandoStatFilterTag(
  q: PandoStatFilterStatKey
): PandoStatFilterTag {
  return {
    q,
    qt: 'final',
  }
}
