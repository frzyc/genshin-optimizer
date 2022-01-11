import { WeaponData } from "../../pipeline";
import { SubstatKey } from "./artifact";
import { DocumentSection } from "./character_WR";
import { CharacterKey, Rarity, WeaponKey, WeaponTypeKey } from "./consts";
import { BasicStats, BonusStats } from "./stats";

export type IWeaponSheets = Record<WeaponKey, IWeaponSheet>

export interface IWeaponSheet {
  weaponType: WeaponTypeKey
  rarity: 1 | 2 | 3 | 4 | 5
  icon: string,
  iconAwaken: string,
  stats?: BonusStats | ((stats: BasicStats) => BonusStats | undefined)
  document: DocumentSection[],
}

export interface IWeapon {
  key: WeaponKey // "CrescentPike"
  level: number // 1-90 inclusive
  ascension: number // 0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number // 1-5 inclusive
  location: CharacterKey | "" // where "" means not equipped.
  lock: boolean
}
export interface ICachedWeapon extends IWeapon {
  id: string
}