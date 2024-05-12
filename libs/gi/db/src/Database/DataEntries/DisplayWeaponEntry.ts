import { validateArr } from '@genshin-optimizer/common/util'
import type { RarityKey, WeaponTypeKey } from '@genshin-optimizer/gi/consts'
import { allRarityKeys, allWeaponTypeKeys } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const weaponSortKeys = ['level', 'rarity', 'name'] as const
export type WeaponSortKey = (typeof weaponSortKeys)[number]
export interface IDisplayWeapon {
  editWeaponId: string
  sortType: WeaponSortKey
  ascending: boolean
  rarity: RarityKey[]
  weaponType: WeaponTypeKey[]
  locked: Array<'locked' | 'unlocked'>
}

const initialState = (): IDisplayWeapon => ({
  editWeaponId: '',
  sortType: weaponSortKeys[0],
  ascending: false,
  rarity: [...allRarityKeys],
  weaponType: [...allWeaponTypeKeys],
  locked: ['locked', 'unlocked'],
})

export class DisplayWeaponEntry extends DataEntry<
  'display_weapon',
  'display_weapon',
  IDisplayWeapon,
  IDisplayWeapon
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_weapon', initialState, 'display_weapon')
  }
  override validate(obj: any): IDisplayWeapon | undefined {
    if (typeof obj !== 'object') return undefined
    let { sortType, ascending, rarity, weaponType, locked } = obj
    const { editWeaponId } = obj
    if (typeof editWeaponId !== 'string') return editWeaponId
    if (
      typeof sortType !== 'string' ||
      !weaponSortKeys.includes(sortType as any)
    )
      sortType = weaponSortKeys[0]
    if (typeof ascending !== 'boolean') ascending = false
    if (!Array.isArray(rarity)) rarity = [...allRarityKeys]
    else rarity = rarity.filter((r) => allRarityKeys.includes(r))
    if (!Array.isArray(weaponType)) weaponType = [...allWeaponTypeKeys]
    else weaponType = weaponType.filter((r) => allWeaponTypeKeys.includes(r))
    locked = validateArr(locked, ['locked', 'unlocked'])
    const data: IDisplayWeapon = {
      editWeaponId,
      sortType,
      ascending,
      rarity,
      weaponType,
      locked,
    }
    return data
  }
  override set(
    value:
      | Partial<IDisplayWeapon>
      | ((v: IDisplayWeapon) => Partial<IDisplayWeapon> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset') return super.set(initialState())
      return false
    } else return super.set(value)
  }
}
