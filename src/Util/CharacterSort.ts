import CharacterSheet from "../Character/CharacterSheet";
import { ArtCharDatabase } from "../Database/Database";
import { CharacterKey } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const characterSortKeys = ["level", "rarity", "name"]
export type CharacterSortKey = typeof characterSortKeys[number]

export function characterSortConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: {
      getValue: (ck) => database._getChar(ck as CharacterKey) ? 0 : 1,
      tieBreaker: "name"
    },
    name: {
      getValue: (ck) => ck,
    },
    level: {
      getValue: (ck) => database._getChar(ck as CharacterKey)?.level ?? 0,
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: (ck) => characterSheets?.[ck]?.star,
      tieBreaker: "level"
    }
  }
}

export function characterFilterConfigs(characterSheets: Record<CharacterKey, CharacterSheet>): FilterConfigs<"element" | "weaponType", CharacterKey> {
  return {
    element: (ck, filter) => !filter || (filter === characterSheets?.[ck]?.elementKey),
    weaponType: (ck, filter) => !filter || (filter === characterSheets?.[ck]?.weaponTypeKey),
  }
}