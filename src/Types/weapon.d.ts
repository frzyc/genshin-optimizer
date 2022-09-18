import { Ascension, LocationKey, Refinement, WeaponKey } from "./consts";

export interface IWeapon {
  key: WeaponKey // "CrescentPike"
  level: number // 1-90 inclusive
  ascension: Ascension // 0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: Refinement // 1-5 inclusive
  location: LocationKey // where "" means not equipped.
  lock: boolean
}
export interface ICachedWeapon extends IWeapon {
  id: string
}
