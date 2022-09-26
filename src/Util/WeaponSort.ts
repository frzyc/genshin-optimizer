import { AllWeaponSheets } from "../Data/Weapons/WeaponSheet";
import i18n from "../i18n";
import { ICachedWeapon } from "../Types/weapon";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const weaponSortKeys = ["level", "rarity", "name"] as const
export type WeaponSortKey = typeof weaponSortKeys[number]
export function weaponSortConfigs(weaponSheets: AllWeaponSheets): SortConfigs<WeaponSortKey, ICachedWeapon> {
  return {
    level: wp => wp.level * (wp.ascension + 1) ?? 0,
    rarity: wp => weaponSheets(wp.key).rarity,
    name: wp => i18n.t(`weaponNames_gen:${wp.key}`) as string
  }
}
export function weaponFilterConfigs(weaponSheets: AllWeaponSheets): FilterConfigs<"rarity" | "weaponType" | "name", ICachedWeapon> {
  return {
    rarity: (wp, filter) => filter.includes(weaponSheets(wp.key).rarity),
    weaponType: (wp, filter) => filter.includes(weaponSheets(wp.key).weaponType),
    name: (wp, filter) => i18n.t(`weaponNames_gen:${wp.key}`).toLowerCase().includes(filter.toLowerCase()),
  }
}

export const weaponSortMap: Partial<Record<WeaponSortKey, WeaponSortKey[]>> = {
  name: ["name"],
  level: ["level", "rarity", "name"],
  rarity: ["rarity", "level", "name"],
}
