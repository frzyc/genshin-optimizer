import { allElements, allWeaponTypeKeys } from "../Types/consts";
import { characterSortKeys } from "../Util/CharacterSort";

export const initialCharacterDisplayState = () => ({
  sortType: characterSortKeys[0],
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElements],
  pageIndex: 0
})
