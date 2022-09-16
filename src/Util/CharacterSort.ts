import CharacterSheet from "../Data/Characters/CharacterSheet";
import { ArtCharDatabase } from "../Database/Database";
import i18n from "../i18n";
import { initCharMeta } from "../stateInit";
import { CharacterKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const characterSortKeys = ["new", "level", "rarity", "name", "favorite"] as const
export type CharacterSortKey = typeof characterSortKeys[number]

export function characterSortConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: {
      getValue: (ck) => database.chars.get(ck as CharacterKey) ? 0 : 1,
      sortByKeys: ["new", "favorite", "name"]
    },
    name: {
      getValue: (ck) => i18n.t(`charNames_gen"${ck}`).toString(),
      sortByKeys: ["name"]
    },
    level: {
      getValue: (ck) => {
        const char = database.chars.get(ck as CharacterKey)
        if (!char) return 0
        return char.level * char.ascension
      },
      sortByKeys: ["level", "rarity", "name"]
    },
    rarity: {
      getValue: (ck) => characterSheets?.[ck]?.rarity,
      sortByKeys: ["rarity", "level", "name"]
    },
    favorite: {
      getValue: (ck) => database.states.getWithInit(`charMeta_${ck}`, initCharMeta).favorite ? 1 : 0,
      sortByKeys: ["favorite"]
    }
  }
}

export type CharacterFilterConfigs = FilterConfigs<"element" | "weaponType" | "name", CharacterKey>
export function characterFilterConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): CharacterFilterConfigs {
  return {
    element: (ck, filter) => filter.includes(characterSheets?.[ck]?.elementKey) ||
      (ck === "Traveler" && !database.chars.get(ck as CharacterKey) && filter.some(fe => characterSheets.Traveler.elementKeys.includes(fe))) ||
      (ck === "Traveler" && filter.includes(database.chars.get(ck as CharacterKey)?.elementKey)),
    weaponType: (ck, filter) => filter.includes(characterSheets?.[ck]?.weaponTypeKey),
    name: (ck, filter) => !filter || (i18n.t(`charNames_gen:${ck}`).toLowerCase().includes(filter.toLowerCase()))
  }
}
