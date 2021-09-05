import { WeaponData } from "../../pipeline";
import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character";
import { Rarity, WeaponKey, WeaponTypeKey } from "./consts";
import { BasicStats, BonusStats } from "./stats";
import { IConditionals } from "./IConditional";

export type IWeaponSheets = Record<WeaponKey, IWeaponSheet>

export interface IWeaponSheet extends WeaponData {
  img: string;
  stats?: BonusStats | ((stats: BasicStats) => BonusStats | undefined)
  conditionals?: IConditionals
  document: DocumentSection[],
}

export interface IFlexWeapon {
  key: WeaponKey // "CrescentPike"
  level: number // 1-90 inclusive
  ascension: number // 0-6 inclusive. need to disambiguate 80/90 or 80/80
  refineIndex: number // 0-4 inclusive
  location: CharacterKey | "" // where "" means not equipped.
}
export interface IWeapon extends IFlexWeapon {
  id: string
}