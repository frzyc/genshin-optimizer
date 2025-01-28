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
    atk_base:
      atk_base * (1 + atk_multiplier[level] / 10000 + 0.8922 * ascension),
    [second_statkey]: second_statvalue * (1 + 0.3 * ascension),
  }

  return stats
}

const atk_multiplier = [
  0, 1568, 3136, 4705, 6273, 7841, 9409, 10977, 12545, 14114, 15682, 17250,
  18818, 20386, 21954, 23523, 25091, 26659, 28227, 29795, 31363, 32932, 34500,
  36068, 37636, 39204, 40772, 42341, 43909, 45477, 47045, 48613, 50181, 51750,
  53318, 54886, 56454, 58022, 59590, 61159, 62727, 64295, 65863, 67431, 68999,
  70568, 72136, 73704, 75272, 76840, 78408, 79977, 81545, 83113, 84681, 86249,
  87817, 89386, 90954, 92522, 94090,
] as const
