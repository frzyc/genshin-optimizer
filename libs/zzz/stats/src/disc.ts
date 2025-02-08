import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export function getDiscStat(dKey: DiscSetKey) {
  return allStats.disc[dKey]
}
