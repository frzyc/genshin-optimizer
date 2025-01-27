import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { CharacterData } from '@genshin-optimizer/zzz/dm'
import { charactersDetailedJSONData } from '@genshin-optimizer/zzz/dm'

export type CharacterDatum = CharacterData

export type CharactersData = Record<CharacterKey, CharacterDatum>
export function characterData(): CharactersData {
  return charactersDetailedJSONData
}
