import {
  groupTwoPc,
  type TwoPcGroup,
  type TwoPcStats,
} from '@genshin-optimizer/common/util'
import type {
  RelicCavernSetKey,
  RelicPlanarSetKey,
} from '@genshin-optimizer/sr/consts'
import {
  allRelicCavernSetKeys,
  allRelicPlanarSetKeys,
} from '@genshin-optimizer/sr/consts'
import { getRelicStat } from './relic'

/**
 * A 2-piece is a plain passive when `otherStats` only repeats those passive
 * values for the description. Extra numbers are thresholds or conditional
 * bonuses (Glamoth, Broken Keel, Space Sealing Station), so the set stays
 * its own row.
 */
function plainTwoPc(
  set: RelicCavernSetKey | RelicPlanarSetKey
): TwoPcStats | null {
  const effect = getRelicStat(set).setEffects.find(
    (entry) => entry.numRequired === 2
  )
  if (!effect) return null
  const values = Object.values(effect.passiveStats).filter(
    (value): value is number => value !== undefined
  )
  if (!values.length || effect.otherStats.length !== values.length) return null
  const remaining = [...effect.otherStats]
  for (const value of values) {
    const index = remaining.indexOf(value)
    if (index < 0) return null
    remaining.splice(index, 1)
  }
  const stats: Record<string, number> = {}
  for (const [key, value] of Object.entries(effect.passiveStats)) {
    if (typeof value === 'number') stats[key] = value
  }
  return stats
}

export const cavernTwoPcGroups: TwoPcGroup<RelicCavernSetKey>[] = groupTwoPc(
  allRelicCavernSetKeys.map((set) => ({ set, stats: plainTwoPc(set) }))
)

export const cavernTwoPcSets: RelicCavernSetKey[] = cavernTwoPcGroups.flatMap(
  (group) => group.sets
)

export const planarTwoPcGroups: TwoPcGroup<RelicPlanarSetKey>[] = groupTwoPc(
  allRelicPlanarSetKeys.map((set) => ({ set, stats: plainTwoPc(set) }))
)

export const planarTwoPcSets: RelicPlanarSetKey[] = planarTwoPcGroups.flatMap(
  (group) => group.sets
)
