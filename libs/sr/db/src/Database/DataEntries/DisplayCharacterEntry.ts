import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import type {
  ElementalTypeKey,
  PathKey,
  RarityKey,
} from '@genshin-optimizer/sr/consts'
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

// Exclude 'new' from allowed sort types for storage
const allowedSortKeys = ['level', 'rarity', 'name', 'favorite'] as const

// Explicit type definition for better type inference
export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  path: PathKey[]
  elementalType: ElementalTypeKey[]
  rarity: RarityKey[]
}

// Schema with defaults - single source of truth
const displayCharacterSchema = z.object({
  sortType: zodEnumWithDefault(allowedSortKeys, 'level'),
  ascending: zodBoolean(),
  path: zodFilteredArray(allPathKeys),
  elementalType: zodFilteredArray(allElementalTypeKeys),
  rarity: zodFilteredArray(allRarityKeys),
}) as z.ZodType<IDisplayCharacterEntry>

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
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayCharacterSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
