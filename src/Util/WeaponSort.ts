import { WeaponKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import WeaponSheet from "../Weapon/WeaponSheet";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const weaponSortKeys = ["level", "rarity"]
export type WeaponSortKey = typeof weaponSortKeys[number]

export function weaponSortConfigs(weaponSheets: Record<WeaponKey, WeaponSheet>): SortConfigs<WeaponSortKey, ICachedWeapon> {
  return {
    level: {
      getValue: wp => wp.level ?? 0,
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: wp => weaponSheets?.[wp.key]?.rarity,
      tieBreaker: "level"
    }
  }
}
export function weaponFilterConfigs(weaponSheets: Record<WeaponKey, WeaponSheet>): FilterConfigs<"rarity" | "weaponType", ICachedWeapon> {
  return {
    rarity: (wp, filter) => filter.includes(weaponSheets?.[wp.key]?.rarity),
    weaponType: (wp, filter) => !filter || (filter === weaponSheets?.[wp.key]?.weaponType),
  }
}