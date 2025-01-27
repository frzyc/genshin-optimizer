import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export function getWengineStat(wKey: WengineKey) {
  return allStats.wengine[wKey]
}
