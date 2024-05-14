import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'

const showPercentKeys = ['hp_', 'def_', 'atk_'] as const
// Special consideration for artifact stats, only display percentage for hp_, atk_ and def_ to distinguish between flat stats.
export function statPercent(statkey: MainStatKey | SubstatKey) {
  return showPercentKeys.includes(statkey as (typeof showPercentKeys)[number])
    ? '%'
    : ''
}
