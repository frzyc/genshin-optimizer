import { AllCharacterSheets } from "../Data/Characters/CharacterSheet";
import { initCharMeta } from "../Database/Data/StateData";
import { ArtCharDatabase } from "../Database/Database";
import i18n from "../i18n";
import { CharacterKey, charKeyToCharName } from "../Types/consts";
import { FilterConfigs, SortConfigs } from "./SortByFilters";
export const characterSortKeys = ["new", "level", "rarity", "name",] as const
export type CharacterSortKey = typeof characterSortKeys[number]

export function characterSortConfigs(database: ArtCharDatabase, characterSheets: AllCharacterSheets): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: {
      getValue: (ck) => database.chars.get(ck as CharacterKey) ? 0 : 1,
      tieBreaker: "name"
    },
    name: {
      getValue: (ck) => i18n.t(`charNames_gen:${charKeyToCharName(ck, database.gender)}`).toString(),
    },
    level: {
      getValue: (ck) => {
        const char = database.chars.get(ck as CharacterKey)
        if (!char) return 0
        return char.level * char.ascension
      },
      tieBreaker: "rarity"
    },
    rarity: {
      getValue: (ck) => characterSheets(ck, database.gender)?.rarity ?? 0,
      tieBreaker: "level"
    }
  }
}

export type CharacterFilterConfigs = FilterConfigs<"element" | "weaponType" | "favorite" | "name", CharacterKey>
export function characterFilterConfigs(database: ArtCharDatabase, characterSheets: AllCharacterSheets): CharacterFilterConfigs {
  return {
    element: (ck, filter) => filter.includes(characterSheets(ck, database.gender)?.elementKey),
    weaponType: (ck, filter) => filter.includes(characterSheets(ck, database.gender)?.weaponTypeKey),
    favorite: (ck, filter) =>
      !filter || (filter === (database.states.getWithInit(`charMeta_${ck}`, initCharMeta).favorite ? "yes" : "no")),
    name: (ck, filter) => !filter || (i18n.t(`charNames_gen:${charKeyToCharName(ck, database.gender)}`).toLowerCase().includes(filter.toLowerCase()))
  }
}
