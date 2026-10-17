import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  charKeyToLocGenderedCharKey,
} from '@genshin-optimizer/gi/consts'
import { i18n } from '@genshin-optimizer/gi/i18n'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import {
  matchesCommandSearchAny,
  splitCamelCaseForSearch,
} from '../../util/commandPaletteSearch'

export type CharacterNameSearchFieldsCache = ReadonlyMap<
  CharacterKey,
  readonly string[]
>

export function characterNameSearchFieldsFor(
  ck: CharacterKey,
  gender: GenderKey,
  silly: boolean
): readonly string[] {
  const locKey = charKeyToLocGenderedCharKey(ck, gender)
  const displayName = i18n
    .t(
      `${
        silly ? 'sillyWisher_charNames' : 'charNames_gen'
      }:${locKey}` as const
    )
    .toString()
  const fields: string[] = [
    displayName,
    ck,
    splitCamelCaseForSearch(ck),
    getCharEle(ck),
  ]
  if (silly) {
    fields.push(
      i18n.t(`charNames_gen:${locKey}` as const).toString()
    )
  }
  return fields
}

export function buildCharacterNameSearchFieldsCache(
  gender: GenderKey,
  silly: boolean
): CharacterNameSearchFieldsCache {
  const map = new Map<CharacterKey, readonly string[]>()
  for (const ck of allCharacterKeys) {
    map.set(ck, characterNameSearchFieldsFor(ck, gender, silly))
  }
  return map
}

export function characterMatchesNameSearch(
  searchFields: CharacterNameSearchFieldsCache,
  ck: CharacterKey,
  filter: string | undefined
): boolean {
  if (filter === undefined || filter === '') return true
  const fields = searchFields.get(ck)
  if (!fields) return false
  return matchesCommandSearchAny([...fields], filter)
}
