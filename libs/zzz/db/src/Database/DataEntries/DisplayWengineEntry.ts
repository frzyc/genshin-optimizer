import { validateArr } from '@genshin-optimizer/common/util'
import type {
  LocationKey,
  SpecialityKey,
  WengineRarityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allLocationKeys,
  allSpecialityKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const wengineSortKeys = ['level', 'rarity', 'name'] as const
export type WengineSortKey = (typeof wengineSortKeys)[number]

export interface IDisplayWengine {
  editWengineId: string
  sortType: WengineSortKey
  ascending: boolean
  rarity: WengineRarityKey[]
  speciality: SpecialityKey[]
  locked: Array<'locked' | 'unlocked'>
  showInventory: boolean
  showEquipped: boolean
  locations: LocationKey[]
}

const initialOption = (): Omit<IDisplayWengine, 'ascending' | 'sortType'> => ({
  editWengineId: '',
  rarity: [...allWengineRarityKeys],
  speciality: [...allSpecialityKeys],
  locked: ['locked', 'unlocked'],
  showEquipped: true,
  showInventory: true,
  locations: [],
})

const initialState = (): IDisplayWengine => ({
  ...initialOption(),
  sortType: wengineSortKeys[0],
  ascending: false,
})

export class DisplayWengineEntry extends DataEntry<
  'display_wengine',
  'display_wengine',
  IDisplayWengine,
  IDisplayWengine
> {
  constructor(database: ZzzDatabase) {
    super(database, 'display_wengine', initialState, 'display_wengine')
  }
  override validate(obj: any): IDisplayWengine | undefined {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj))
      return undefined
    let {
      sortType,
      ascending,
      rarity,
      speciality,
      locked,
      showEquipped,
      showInventory,
      locations,
    } = obj
    const { editWengineId } = obj
    if (typeof editWengineId !== 'string') return undefined
    if (
      typeof sortType !== 'string' ||
      !wengineSortKeys.includes(sortType as any)
    )
      sortType = wengineSortKeys[0]
    if (typeof ascending !== 'boolean') ascending = false
    if (typeof showEquipped !== 'boolean') showEquipped = true
    if (typeof showInventory !== 'boolean') showInventory = true
    speciality = validateArr(speciality, allSpecialityKeys)
    rarity = validateArr(rarity, allWengineRarityKeys)
    locked = validateArr(locked, ['locked', 'unlocked'])
    locations = validateArr(locations, allLocationKeys)
    const data: IDisplayWengine = {
      editWengineId,
      sortType,
      ascending,
      rarity,
      speciality,
      locked,
      showEquipped,
      showInventory,
      locations,
    }
    return data
  }
  override set(
    value:
      | Partial<IDisplayWengine>
      | ((v: IDisplayWengine) => Partial<IDisplayWengine> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset') return super.set(initialOption())
      return false
    } else return super.set(value)
  }
}
