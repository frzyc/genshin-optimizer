import {
  groupTwoPc,
  type TwoPcGroup,
  type TwoPcStats,
} from '@genshin-optimizer/common/util'
import { allDiscSetKeys, type DiscSetKey, disc2pEffect } from './disc'

/**
 * 2-piece formulas that `disc2pEffect` does not describe. Shadow Harmony's
 * table entry is a single `dmg_` value, but the sheet applies dash and
 * aftershock separately. Dawn's Bloom is filled in by hand.
 */
const specialDisc2p = new Set<DiscSetKey>(['DawnsBloom', 'ShadowHarmony'])

function discStats(set: DiscSetKey): TwoPcStats | null {
  if (specialDisc2p.has(set)) return null
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(disc2pEffect[set])) {
    if (typeof value === 'number') out[key] = value
  }
  return Object.keys(out).length ? out : null
}

export const discTwoPcGroups: TwoPcGroup<DiscSetKey>[] = groupTwoPc(
  allDiscSetKeys.map((set) => ({ set, stats: discStats(set) }))
)

export const discTwoPcSets: DiscSetKey[] = discTwoPcGroups.flatMap(
  (group) => group.sets
)
