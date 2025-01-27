import { clamp } from '@genshin-optimizer/common/util'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export function getWengineStat(wKey: WengineKey) {
  return allStats.wengine[wKey]
}

export function getWengineStats(wk: WengineKey, level: number) {
  const { atk_base, second_statkey, second_statvalue } = getWengineStat(wk)
  const ascension = clamp(Math.floor(level / 10), 0, 5)
  const stats: Record<string, number> = {
    atk_base: atk_base * (1 + 0.1568 * (level - 1) + 0.8922 * ascension),
    [second_statkey]: second_statvalue * (1 + 0.3 * ascension),
  }

  return stats
}
