import CharacterSheet from "../Data/Characters/CharacterSheet";
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
      getValue: (ck) => characterSheets?.[ck]?.rarity,
      tieBreaker: "level"
    }
  }
}

export type CharacterFilterConfigs = FilterConfigs<"element" | "weaponType" | "favorite", CharacterKey>
export function characterFilterConfigs(database: ArtCharDatabase, characterSheets: Record<CharacterKey, CharacterSheet>): CharacterFilterConfigs {
  return {
    element: (ck, filter) => !filter || (filter === characterSheets?.[ck]?.elementKey) || (ck === "Traveler" && database._getChar(ck as CharacterKey)?.elementKey === filter),
    weaponType: (ck, filter) => !filter || (filter === characterSheets?.[ck]?.weaponTypeKey),
    favorite: (ck, filter) =>
      !filter || (filter === (database._getChar(ck as CharacterKey)?.favorite ? "yes" : "no"))
  }
}
