import { zodFilteredArray } from '@genshin-optimizer/common/database'
import type {
  CharacterRarityKey,
  ElementKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allCharacterRarityKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const characterSortKeys = [
  'new',
  'level',
  'rarity',
  'name',
  'favorite',
] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

// Explicit type definition for better type inference
export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  rarity: CharacterRarityKey[]
}

// Schema with defaults - single source of truth
const displayCharacterSchema = z.object({
  // Disallow 'new' as explicit sort - use 'level' as fallback
  sortType: z
    .enum(characterSortKeys)
    .refine((val) => val !== 'new')
    .catch('level'),
  ascending: z.boolean().catch(false),
  weaponType: zodFilteredArray(allWeaponTypeKeys, [...allWeaponTypeKeys]),
  element: zodFilteredArray(allElementKeys, [...allElementKeys]),
  rarity: zodFilteredArray(allCharacterRarityKeys, [...allCharacterRarityKeys]),
}) as z.ZodType<IDisplayCharacterEntry>

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: ArtCharDatabase) {
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
