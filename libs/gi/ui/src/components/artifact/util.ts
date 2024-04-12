import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'

export const artifactLevelVariant = (level: number) =>
  ('roll' + (Math.floor(Math.max(level, 0) / 4) + 1)) as RollColorKey

export const allRollColorKeys = [
  'roll1',
  'roll2',
  'roll3',
  'roll4',
  'roll5',
  'roll6',
] as const
export type RollColorKey = (typeof allRollColorKeys)[number]

const showPercentKeys = ['hp_', 'def_', 'atk_'] as const
// Special consideration for artifact stats, only display percentage for hp_, atk_ and def_ to distinguish between flat stats.
export function artStatPercent(statkey: MainStatKey | SubstatKey) {
  return showPercentKeys.includes(statkey as (typeof showPercentKeys)[number])
    ? '%'
    : ''
}
