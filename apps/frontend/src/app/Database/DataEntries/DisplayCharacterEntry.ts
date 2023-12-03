import type {
  CharacterRarityKey,
  ElementKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import {
  allElementKeys,
  allWeaponTypeKeys,
  allCharacterRarityKeys,
} from '@genshin-optimizer/consts'
import { validateArr } from '@genshin-optimizer/util'
import type { CharacterSortKey } from '../../Util/CharacterSort'
import { characterSortKeys } from '../../Util/CharacterSort'
import type { ArtCharDatabase } from '../Database'
import { DataEntry } from '../DataEntry'

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  rarity: CharacterRarityKey[]
  pageIndex: number
}

const initialState = (): IDisplayCharacterEntry => ({
  sortType: 'level',
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElementKeys],
  rarity: [...allCharacterRarityKeys],
  pageIndex: 0,
})

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_character', initialState, 'display_character')
  }
  override validate(obj: any): IDisplayCharacterEntry | undefined {
    if (typeof obj !== 'object') return undefined
    let { sortType, ascending, weaponType, element, rarity, pageIndex } = obj

    //Disallow sorting by "new" explicitly.
    if (sortType === 'new' || !characterSortKeys.includes(sortType))
      sortType = 'level'
    if (typeof ascending !== 'boolean') ascending = false
    weaponType = validateArr(weaponType, allWeaponTypeKeys)
    element = validateArr(element, allElementKeys)
    rarity = validateArr(rarity, allCharacterRarityKeys)
    if (
      typeof pageIndex !== 'number' ||
      pageIndex < 0 ||
      !Number.isInteger(pageIndex)
    )
      pageIndex = 0
    const data: IDisplayCharacterEntry = {
      sortType,
      ascending,
      weaponType,
      element,
      rarity,
      pageIndex,
    }
    return data
  }
}
