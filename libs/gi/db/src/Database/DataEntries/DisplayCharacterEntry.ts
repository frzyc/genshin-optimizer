import { zodFilteredArray } from '@genshin-optimizer/common/database'
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

const persistedSortKeys = ['level', 'rarity', 'name', 'favorite'] as const

const displayCharacterSchema = z.object({
  sortType: z.enum(persistedSortKeys).catch('level'),
  ascending: z.boolean().catch(false),
  weaponType: zodFilteredArray(allWeaponTypeKeys, [...allWeaponTypeKeys]),
  element: zodFilteredArray(allElementKeys, [...allElementKeys]),
  rarity: zodFilteredArray(allCharacterRarityKeys, [...allCharacterRarityKeys]),
})
export type IDisplayCharacterEntry = z.infer<typeof displayCharacterSchema>

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
    const result = displayCharacterSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
