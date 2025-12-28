import { zodFilteredArray } from '@genshin-optimizer/common/database'
import type {
  LocationCharacterKey,
  RarityKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allLocationCharacterKeys,
  allRarityKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const weaponSortKeys = ['level', 'rarity', 'name'] as const
export type WeaponSortKey = (typeof weaponSortKeys)[number]

// Explicit type definition for better type inference
export interface IDisplayWeapon {
  editWeaponId: string
  sortType: WeaponSortKey
  ascending: boolean
  rarity: RarityKey[]
  weaponType: WeaponTypeKey[]
  locked: Array<'locked' | 'unlocked'>
  showEquipped: boolean
  showInventory: boolean
  locations: LocationCharacterKey[]
}

// Schema with defaults - single source of truth
const displayWeaponSchemaInternal = z.object({
  editWeaponId: z.string().catch(''),
  sortType: z.enum(weaponSortKeys).catch('level'),
  ascending: z.boolean().catch(false),
  rarity: zodFilteredArray(allRarityKeys, [...allRarityKeys]),
  weaponType: zodFilteredArray(allWeaponTypeKeys, [...allWeaponTypeKeys]),
  locked: zodFilteredArray(['locked', 'unlocked'] as const, [
    'locked',
    'unlocked',
  ]),
  showEquipped: z.boolean().catch(true),
  showInventory: z.boolean().catch(true),
  locations: zodFilteredArray(allLocationCharacterKeys, []),
})

// Typed version for external use
const displayWeaponSchema =
  displayWeaponSchemaInternal as z.ZodType<IDisplayWeapon>

// Reset schema type (excludes sortType and ascending - those are preserved on reset)
type ResetOptions = Omit<IDisplayWeapon, 'sortType' | 'ascending'>

// Reset schema (excludes sortType and ascending - those are preserved on reset)
const resetSchema = displayWeaponSchemaInternal.omit({
  sortType: true,
  ascending: true,
}) as z.ZodType<ResetOptions>

export class DisplayWeaponEntry extends DataEntry<
  'display_weapon',
  'display_weapon',
  IDisplayWeapon,
  IDisplayWeapon
> {
  constructor(database: ArtCharDatabase) {
    super(
      database,
      'display_weapon',
      () => displayWeaponSchema.parse({}),
      'display_weapon'
    )
  }
  override validate(obj: unknown): IDisplayWeapon | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined
    const result = displayWeaponSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  override set(
    value:
      | Partial<IDisplayWeapon>
      | ((v: IDisplayWeapon) => Partial<IDisplayWeapon> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset') return super.set(resetSchema.parse({}))
      return false
    } else return super.set(value)
  }
}
