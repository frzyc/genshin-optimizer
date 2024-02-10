import { validateArr } from '@genshin-optimizer/common/util'
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
import { DataEntry } from '../DataEntry'
import type { ArtCharDatabase } from '../ArtCharDatabase'

export const characterSortKeys = [
  'new',
  'level',
  'rarity',
  'name',
  'favorite',
] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

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
