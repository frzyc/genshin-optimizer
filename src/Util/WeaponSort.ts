import { WeaponKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
import i18n from "../i18n";
export const weaponSortKeys = ["level", "rarity"]
export type WeaponSortKey = typeof weaponSortKeys[number]

export function weaponSortConfigs(weaponSheets: Record<WeaponKey, WeaponSheet>): SortConfigs<WeaponSortKey, ICachedWeapon> {
  return {
    level: {
      getValue: wp => wp.level * wp.ascension ?? 0,
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: wp => weaponSheets?.[wp.key]?.rarity,
      tieBreaker: "level"
    }
  }
}
export function weaponFilterConfigs(weaponSheets: Record<WeaponKey, WeaponSheet>): FilterConfigs<"rarity" | "weaponType" | "name", ICachedWeapon> {
  return {
    rarity: (wp, filter) => filter.includes(weaponSheets?.[wp.key]?.rarity),
    weaponType: (wp, filter) => filter.includes(weaponSheets?.[wp.key]?.weaponType),
    // TODO: Add types to this. filter may or may not be an array?
    name: (wp, filter) => i18n.t(`weaponNames_gen:${wp.key}`).toLowerCase().includes(filter.toLowerCase()),
  }
}
