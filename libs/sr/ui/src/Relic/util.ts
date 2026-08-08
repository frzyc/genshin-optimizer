import type {
  RelicMainStatKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'

export const relicLevelVariant = (level: number) =>
  `roll${Math.floor(Math.max(level, 0) / 3) + 1}` as RollColorKey

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
/**
 * Special consideration for relic stats, only display percentage for hp_, atk_ and def_ to distinguish between flat stats.
 */
export function relicStatPercent(statkey: RelicMainStatKey | RelicSubStatKey) {
  return showPercentKeys.includes(statkey as (typeof showPercentKeys)[number])
    ? '%'
    : ''
}
