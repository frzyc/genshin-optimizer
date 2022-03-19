import { CharacterKey, WeaponKey } from "./consts";

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
