import { WeaponTypeKey } from "pipeline";
import { allElements, allWeaponTypeKeys, ElementKey } from "../../Types/consts";
import { CharacterSortKey, characterSortKeys } from "../../Util/CharacterSort";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";
import { validateArr } from "../validationUtil";

export interface IDisplayCharacterEntry {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  pageIndex: number
}

const initialState = () => ({
  sortType: characterSortKeys[0],
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElements],
  pageIndex: 0
})

export class DisplayCharacterEntry extends DataEntry<"display_weapon", "display_weapon", IDisplayCharacterEntry, IDisplayCharacterEntry>{
  constructor(database: ArtCharDatabase) {
    super(database, "display_weapon", initialState, "display_weapon",)
  }
  validate(obj: any): IDisplayCharacterEntry | undefined {
    if (typeof obj !== "object") return
    let { sortType, ascending, weaponType, element, pageIndex } = obj
    if (!characterSortKeys.includes(sortType)) sortType = characterSortKeys[0]
    if (typeof ascending !== "boolean") ascending = false
    weaponType = validateArr(weaponType, allWeaponTypeKeys)
    element = validateArr(element, allElements)
    if (typeof pageIndex !== "number" || pageIndex < 0 || !Number.isInteger(pageIndex)) pageIndex = 0
    const data: IDisplayCharacterEntry = { sortType, ascending, weaponType, element, pageIndex }
    return data
  }
}
