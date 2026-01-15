import { zodFilteredArray } from '@genshin-optimizer/common/database'
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

const lockedValues = ['locked', 'unlocked'] as const

const displayWeaponSchema = z.object({
  editWeaponId: z.string().catch(''),
  sortType: z.enum(weaponSortKeys).catch('level'),
  ascending: z.boolean().catch(false),
  rarity: zodFilteredArray(allRarityKeys, [...allRarityKeys]),
  weaponType: zodFilteredArray(allWeaponTypeKeys, [...allWeaponTypeKeys]),
  locked: zodFilteredArray(lockedValues, [...lockedValues]),
  showEquipped: z.boolean().catch(true),
  showInventory: z.boolean().catch(true),
  locations: zodFilteredArray(allLocationCharacterKeys, []),
})
export type IDisplayWeapon = z.infer<typeof displayWeaponSchema>

const resetSchema = displayWeaponSchema.omit({
  sortType: true,
  ascending: true,
})

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
