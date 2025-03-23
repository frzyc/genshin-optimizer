import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import {
  type AttributeKey,
  type CharacterKey,
  type CharacterRarityKey,
  type SpecialityKey,
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import type { ZzzDatabase } from '@genshin-optimizer/zzz/db'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
export const characterSortKeys = ['new', 'level', 'rarity', 'name'] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

export function characterSortConfigs(
  database: ZzzDatabase
): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: (ck) => (database.chars.get(ck as CharacterKey) ? 0 : 1),
    name: (ck) => i18n.t(ck).toString(),
    level: (ck) => {
      const char = database.chars.get(ck as CharacterKey)
      return char ? char.level * (char.promotion + 1) : 0
    },
    rarity: (ck) => getCharStat(ck).rarity ?? 0,
  }
}

export const characterFilterKeys = [
  'attribute',
  'specialtyType',
  'rarity',
  'name',
  'new',
] as const
export type CharacterFilterKey = (typeof characterFilterKeys)[number]

export type CharacterFilterConfigs = FilterConfigs<
  CharacterFilterKey,
  CharacterKey
>
export function characterFilterConfigs(
  database: ZzzDatabase
): CharacterFilterConfigs {
  return {
    attribute: (ck, filter) => filter.includes(getCharStat(ck).attribute),
    specialtyType: (ck, filter) => filter.includes(getCharStat(ck).specialty),
    rarity: (ck, filter) => filter.includes(getCharStat(ck).rarity),
    name: (ck, filter) =>
      filter === undefined ||
      i18n.t(ck).toLowerCase().includes(filter.toLowerCase()),
    new: (ck, filter) =>
      filter === undefined ||
      filter === (database.chars.get(ck as CharacterKey) ? 'no' : 'yes'),
  }
}

export const characterSortMap: Partial<
  Record<CharacterSortKey, CharacterSortKey[]>
> = {
  name: ['name'],
  level: ['level', 'rarity', 'name'],
  rarity: ['rarity', 'level', 'name'],
}

export const initialCharacterDisplayState = (): {
  sortType: CharacterSortKey
  ascending: boolean
  specialtyType: SpecialityKey[]
  attribute: AttributeKey[]
  rarity: CharacterRarityKey[]
  pageIndex: number
} => ({
  sortType: characterSortKeys[0],
  ascending: false,
  specialtyType: [...allSpecialityKeys],
  attribute: [...allAttributeKeys],
  rarity: [...allCharacterRarityKeys],
  pageIndex: 0,
})
