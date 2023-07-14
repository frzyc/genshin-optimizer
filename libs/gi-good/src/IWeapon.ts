import type {
  AscensionKey,
  LocationKey,
  RefinementKey,
  WeaponKey,
} from '@genshin-optimizer/consts'

export interface IWeapon {
  key: WeaponKey // "CrescentPike"
  level: number // 1-90 inclusive
  ascension: AscensionKey // 0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: RefinementKey // 1-5 inclusive
  location: LocationKey // where "" means not equipped.
  lock: boolean
}
