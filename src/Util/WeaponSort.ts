import { ArtCharDatabase } from "../Database/Database";
import { WeaponKey } from "../Types/consts";
import WeaponSheet from "../Weapon/WeaponSheet";
import { SortOptions } from "./SortByFilters";
export const sortKeys = ["level", "rarity"]
export default function WeaponSortOptions(database: ArtCharDatabase, weaponSheets: StrictDict<WeaponKey, WeaponSheet>): SortOptions {
  return {
    level: {
      getValue: (id: string) => database._getWeapon(id)?.level ?? 0,
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: (id) => weaponSheets?.[database._getWeapon(id)?.key as any]?.rarity,
      tieBreaker: "level"
    }
  }
}