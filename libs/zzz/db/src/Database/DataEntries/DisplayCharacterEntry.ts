import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const characterSortKeys = ['new', 'level', 'rarity', 'name'] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

const persistedSortKeys = ['level', 'rarity', 'name'] as const
type PersistedSortKey = (typeof persistedSortKeys)[number]

const displayCharacterSchema = z.object({
  sortType: zodEnumWithDefault(
    persistedSortKeys,
    'level'
  ) as z.ZodType<PersistedSortKey>,
  ascending: zodBoolean(),
  specialtyType: zodFilteredArray(allSpecialityKeys),
  attribute: zodFilteredArray(allAttributeKeys),
  rarity: zodFilteredArray(allCharacterRarityKeys),
})
export type IDisplayCharacterEntry = z.infer<typeof displayCharacterSchema>

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: ZzzDatabase) {
    super(
      database,
      'display_character',
      () => displayCharacterSchema.parse({}),
      'display_character'
    )
  }
  override validate(obj: unknown): IDisplayCharacterEntry | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayCharacterSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
