import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export function getCharStat(ck: CharacterKey) {
  return allStats.char[ck]
}
