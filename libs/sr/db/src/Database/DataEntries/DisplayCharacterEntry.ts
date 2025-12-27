import { validateArr } from '@genshin-optimizer/common/util'
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

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  path: PathKey[]
  elementalType: ElementalTypeKey[]
  rarity: RarityKey[]
}

const initialState = (): IDisplayCharacterEntry => ({
  sortType: 'level',
  ascending: false,
  path: [...allPathKeys],
  elementalType: [...allElementalTypeKeys],
  rarity: [...allRarityKeys],
})

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: SroDatabase) {
    super(database, 'display_character', initialState, 'display_character')
  }
  override validate(obj: any): IDisplayCharacterEntry | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined
    let { sortType, ascending, path, elementalType, rarity } = obj

    //Disallow sorting by "new" explicitly.
    if (sortType === 'new' || !characterSortKeys.includes(sortType))
      sortType = 'level'
    if (typeof ascending !== 'boolean') ascending = false
    path = validateArr(path, allPathKeys)
    elementalType = validateArr(elementalType, allElementalTypeKeys)
    rarity = validateArr(rarity, allRarityKeys)

    const data: IDisplayCharacterEntry = {
      sortType,
      ascending,
      path,
      elementalType,
      rarity,
    }
    return data
  }
}
