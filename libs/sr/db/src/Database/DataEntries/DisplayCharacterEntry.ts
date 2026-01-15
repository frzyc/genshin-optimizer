import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import {
  allElementalTypeKeys,
  allPathKeys,
  allRarityKeys,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'

export const characterSortKeys = [
  'new',
  'level',
  'rarity',
  'name',
  'favorite',
] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

const allowedSortKeys = ['level', 'rarity', 'name', 'favorite'] as const

const displayCharacterSchema = z.object({
  sortType: zodEnumWithDefault(allowedSortKeys, 'level'),
  ascending: zodBoolean(),
  path: zodFilteredArray(allPathKeys),
  elementalType: zodFilteredArray(allElementalTypeKeys),
  rarity: zodFilteredArray(allRarityKeys),
})
export type IDisplayCharacterEntry = z.infer<typeof displayCharacterSchema>

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: SroDatabase) {
    super(
      database,
      'display_character',
      () => displayCharacterSchema.parse({}),
      'display_character'
    )
  }
  override validate(obj: unknown): IDisplayCharacterEntry | undefined {
    const result = displayCharacterSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
