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

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  rarity: CharacterRarityKey[]
}

const initialState = (): IDisplayCharacterEntry => ({
  sortType: 'level',
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElementKeys],
  rarity: [...allCharacterRarityKeys],
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
    if (typeof obj !== 'object' || obj === null) return undefined
    let { sortType, ascending, weaponType, element, rarity } = obj

    //Disallow sorting by "new" explicitly.
    if (sortType === 'new' || !characterSortKeys.includes(sortType))
      sortType = 'level'
    if (typeof ascending !== 'boolean') ascending = false
    weaponType = validateArr(weaponType, allWeaponTypeKeys)
    element = validateArr(element, allElementKeys)
    rarity = validateArr(rarity, allCharacterRarityKeys)

    const data: IDisplayCharacterEntry = {
      sortType,
      ascending,
      weaponType,
      element,
      rarity,
    }
    return data
  }
}
