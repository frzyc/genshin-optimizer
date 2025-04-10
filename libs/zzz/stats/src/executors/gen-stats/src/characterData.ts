import { objMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { charactersDetailedJSONData } from '@genshin-optimizer/zzz/dm'
import type { CharacterDatum } from '../../../char'

export type CharactersData = Record<CharacterKey, CharacterDatum>
export function getCharactersData(): CharactersData {
  return objMap(
    charactersDetailedJSONData,
    ({
      id,
      rarity,
      attribute,
      specialty,
      faction,
      stats,
      promotionStats,
      coreStats,
    }) => ({
      id,
      rarity,
      attribute,
      specialty,
      faction,
      stats,
      promotionStats,
      coreStats,
    })
  )
}
