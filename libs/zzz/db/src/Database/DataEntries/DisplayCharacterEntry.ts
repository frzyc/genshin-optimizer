import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import type {
  AttributeKey,
  CharacterRarityKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
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

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  specialtyType: SpecialityKey[]
  attribute: AttributeKey[]
  rarity: CharacterRarityKey[]
}

// Exclude 'new' from allowed sort types for storage
const allowedSortKeys = ['level', 'rarity', 'name'] as const

// Schema with defaults - single source of truth
const displayCharacterSchema = z.object({
  sortType: zodEnumWithDefault(allowedSortKeys, 'level'),
  ascending: zodBoolean(),
  specialtyType: zodFilteredArray(allSpecialityKeys),
  attribute: zodFilteredArray(allAttributeKeys),
  rarity: zodFilteredArray(allCharacterRarityKeys),
}) as z.ZodType<IDisplayCharacterEntry>

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
