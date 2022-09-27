import { WeaponTypeKey } from "pipeline";
import { allRarities, allWeaponTypeKeys, Rarity } from "../../Types/consts";
import { weaponSortKeys } from "../../Util/WeaponSort";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";

export interface IDisplayWeapon {
  editWeaponId: string,
  sortType: typeof weaponSortKeys[number],
  ascending: boolean,
  rarity: Rarity[],
  weaponType: WeaponTypeKey[],
}

const initialState = () => ({
  editWeaponId: "",
  sortType: weaponSortKeys[0],
  ascending: false,
  rarity: [...allRarities],
  weaponType: [...allWeaponTypeKeys],
})

export class DisplayWeaponEntry extends DataEntry<"display_weapon", "display_weapon", IDisplayWeapon, IDisplayWeapon>{
  constructor(database: ArtCharDatabase) {
    super(database, "display_weapon", initialState, "display_weapon")
  }
  validate(obj: any): IDisplayWeapon | undefined {
    if (typeof obj !== "object") return
    let { editWeaponId, sortType, ascending, rarity, weaponType } = obj
    if (typeof editWeaponId !== "string") return editWeaponId
    if (typeof sortType !== "string" || !weaponSortKeys.includes(sortType as any)) sortType = weaponSortKeys[0]
    if (typeof ascending !== "boolean") ascending = false
    if (!Array.isArray(rarity)) rarity = [...allRarities]
    else rarity = rarity.filter(r => allRarities.includes(r))
    if (!Array.isArray(weaponType)) weaponType = [...allWeaponTypeKeys]
    else weaponType = weaponType.filter(r => allWeaponTypeKeys.includes(r))
    const data: IDisplayWeapon = { editWeaponId, sortType, ascending, rarity, weaponType }
    return data
  }
}
