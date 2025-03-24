import { validateArr } from '@genshin-optimizer/common/util'
import type {
  AttributeKey,
  CharacterRarityKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const characterSortKeys = ['new', 'level', 'rarity', 'name'] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  specialtyType: SpecialityKey[]
  attribute: AttributeKey[]
  rarity: CharacterRarityKey[]
}

const initialState = (): IDisplayCharacterEntry => ({
  sortType: 'level',
  ascending: false,
  specialtyType: [...allSpecialityKeys],
  attribute: [...allAttributeKeys],
  rarity: [...allCharacterRarityKeys],
})

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: ZzzDatabase) {
    super(database, 'display_character', initialState, 'display_character')
  }
  override validate(obj: any): IDisplayCharacterEntry | undefined {
    if (typeof obj !== 'object') return undefined
    let { sortType, ascending, specialtyType, attribute, rarity } = obj

    //Disallow sorting by "new" explicitly.
    if (sortType === 'new' || !characterSortKeys.includes(sortType))
      sortType = 'level'
    if (typeof ascending !== 'boolean') ascending = false
    specialtyType = validateArr(specialtyType, allSpecialityKeys)
    attribute = validateArr(attribute, allAttributeKeys)
    rarity = validateArr(rarity, allCharacterRarityKeys)

    const data: IDisplayCharacterEntry = {
      sortType,
      ascending,
      specialtyType,
      attribute,
      rarity,
    }
    return data
  }
}
