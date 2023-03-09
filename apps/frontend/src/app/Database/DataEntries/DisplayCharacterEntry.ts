import type { ElementKey, WeaponTypeKey } from '../../Types/consts'
import { allElements, allWeaponTypeKeys } from '../../Types/consts'
import type { CharacterSortKey } from '../../Util/CharacterSort'
import { characterSortKeys } from '../../Util/CharacterSort'
import type { ArtCharDatabase } from '../Database'
import { DataEntry } from '../DataEntry'
import { validateArr } from '../validationUtil'

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  pageIndex: number
}

const initialState = (): IDisplayCharacterEntry => ({
  sortType: 'level',
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElements],
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
  validate(obj: any): IDisplayCharacterEntry | undefined {
    if (typeof obj !== 'object') return
    let { sortType, ascending, weaponType, element, pageIndex } = obj

    //Disallow sorting by "new" explicitly.
    if (sortType === 'new' || !characterSortKeys.includes(sortType))
      sortType = 'level'
    if (typeof ascending !== 'boolean') ascending = false
    weaponType = validateArr(weaponType, allWeaponTypeKeys)
    element = validateArr(element, allElements)
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
      pageIndex,
    }
    return data
  }
}
