import CharacterSheet from "../Character/CharacterSheet";
import { ArtCharDatabase } from "../Database/Database";
import { CharacterKey } from "../Types/consts";
import { SortOptions } from "./SortByFilters";
export const sortKeys = ["level", "rarity", "name"]
export default function characterSortOptions(database: ArtCharDatabase, characterSheets: StrictDict<CharacterKey, CharacterSheet>): SortOptions {
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