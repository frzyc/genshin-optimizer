import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { disc2pEffect } from '@genshin-optimizer/zzz/consts'
import type { BaseStats, DiscStats } from './common'

export function getSum(baseStats: BaseStats, discs: DiscStats[]) {
  const sum = { ...baseStats }
  for (const d of discs) {
    for (const key in d.stats) {
      sum[key] = (sum[key] || 0) + d.stats[key]
    }
  }
  for (const [key, value] of Object.entries(sum)) {
    if (value > 2 && disc2pEffect[key as DiscSetKey])
      for (const [k, v] of Object.entries(disc2pEffect[key as DiscSetKey]))
        sum[k] = (sum[k] || 0) + v
  }
  // Rudimentary Calculations
  sum['hp'] = (sum['hp_base'] || 0) * (1 + (sum['hp_'] || 0)) + (sum['hp'] || 0)
  sum['atk'] = (sum['atk_base'] || 0) * (1 + (sum['atk_'] || 0))
  sum['def'] = (sum['def_base'] || 0) * (1 + (sum['def_'] || 0))
  return sum
}
