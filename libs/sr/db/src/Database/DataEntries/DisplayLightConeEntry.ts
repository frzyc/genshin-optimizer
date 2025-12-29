import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import { allPathKeys, allRarityKeys } from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'

export const lightConeSortKeys = ['level', 'rarity', 'name'] as const
export type LightConeSortKey = (typeof lightConeSortKeys)[number]

const displayLightConeSchema = z.object({
  sortType: zodEnumWithDefault(lightConeSortKeys, 'level'),
  ascending: zodBoolean(),
  rarity: zodFilteredArray(allRarityKeys),
  path: zodFilteredArray(allPathKeys),
})
export type IDisplayLightCone = z.infer<typeof displayLightConeSchema>

export class DisplayLightConeEntry extends DataEntry<
  'display_lightcone',
  'display_lightcone',
  IDisplayLightCone,
  IDisplayLightCone
> {
  constructor(database: SroDatabase) {
    super(
      database,
      'display_lightcone',
      () => displayLightConeSchema.parse({}),
      'display_lightcone'
    )
  }
  override validate(obj: unknown): IDisplayLightCone | undefined {
    const result = displayLightConeSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
