import type {
  CharacterKey,
  ElementKey,
  WeaponTypeKey,
} from '@genshin-optimizer/consts'
import {
  allElementKeys,
  allWeaponTypeKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/consts'
import { allStats, getCharEle } from '@genshin-optimizer/gi-stats'
import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/util'
import type { ArtCharDatabase } from '../Database/Database'
import i18n from '../i18next/i18n'
import { charKeyToCharName } from '../Types/consts'
export const characterSortKeys = [
  'new',
  'level',
  'rarity',
  'name',
  'favorite',
] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

export function characterSortConfigs(
  database: ArtCharDatabase,
  silly: boolean
): SortConfigs<CharacterSortKey, CharacterKey> {
  return {
    new: (ck) => (database.chars.get(ck as CharacterKey) ? 0 : 1),
    name: (ck) =>
      i18n
        .t(
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen' // Should already be loaded by caller
          }:${charKeyToCharName(ck, database.gender)}`
        )
        .toString(),
    level: (ck) => {
      const char = database.chars.get(ck as CharacterKey)
      return char ? char.level * (char.ascension + 1) : 0
    },
    rarity: (ck) => allStats.char.data[charKeyToLocCharKey(ck)].rarity ?? 0,
    favorite: (ck) => (database.charMeta.get(ck).favorite ? 1 : 0),
  }
}

export const characterFilterKeys = [
  'element',
  'weaponType',
  'name',
  'new',
] as const
export type CharacterFilterKey = (typeof characterFilterKeys)[number]

export type CharacterFilterConfigs = FilterConfigs<
  CharacterFilterKey,
  CharacterKey
>
export function characterFilterConfigs(
  database: ArtCharDatabase,
  silly: boolean
): CharacterFilterConfigs {
  return {
    element: (ck, filter) => filter.includes(getCharEle(ck)),
    weaponType: (ck, filter) =>
      filter.includes(allStats.char.data[charKeyToLocCharKey(ck)].weaponType),
    name: (ck, filter) =>
      filter === undefined ||
      i18n
        .t(
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen' // Should already be loaded by caller
          }:${charKeyToCharName(ck, database.gender)}`
        )
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      (silly &&
        i18n
          .t(`charNames_gen:${charKeyToCharName(ck, database.gender)}`)
          .toLowerCase()
          .includes(filter.toLowerCase())),
    new: (ck, filter) =>
      filter === undefined ||
      filter === (database.chars.get(ck as CharacterKey) ? 'no' : 'yes'),
  }
}

export const characterSortMap: Partial<
  Record<CharacterSortKey, CharacterSortKey[]>
> = {
  name: ['favorite', 'name'],
  level: ['favorite', 'level', 'rarity', 'name'],
  rarity: ['favorite', 'rarity', 'level', 'name'],
}

export const initialCharacterDisplayState = (): {
  sortType: CharacterSortKey
  ascending: boolean
  weaponType: WeaponTypeKey[]
  element: ElementKey[]
  pageIndex: number
} => ({
  sortType: characterSortKeys[0],
  ascending: false,
  weaponType: [...allWeaponTypeKeys],
  element: [...allElementKeys],
  pageIndex: 0,
})
