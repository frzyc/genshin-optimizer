import { AllWeaponSheets } from "../Data/Weapons/WeaponSheet";
import i18n from "../i18n";
import { ICachedWeapon } from "../Types/weapon";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const weaponSortKeys = ["level", "rarity"]
export type WeaponSortKey = typeof weaponSortKeys[number]

export function weaponSortConfigs(weaponSheets: AllWeaponSheets): SortConfigs<WeaponSortKey, ICachedWeapon> {
  return {
    level: {
      getValue: wp => wp.level * wp.ascension ?? 0,
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: wp => weaponSheets(wp.key).rarity,
      tieBreaker: "level"
    }
  }
}
export function weaponFilterConfigs(weaponSheets: AllWeaponSheets): FilterConfigs<"rarity" | "weaponType" | "name", ICachedWeapon> {
  return {
    rarity: (wp, filter) => filter.includes(weaponSheets(wp.key).rarity),
    weaponType: (wp, filter) => filter.includes(weaponSheets(wp.key).weaponType),
    // TODO: Add types to this. filter may or may not be an array?
    name: (wp, filter) => i18n.t(`weaponNames_gen:${wp.key}`).toLowerCase().includes(filter.toLowerCase()),
  }
}
