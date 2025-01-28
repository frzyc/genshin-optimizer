import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc, Stats } from '@genshin-optimizer/zzz/db'

export const MAX_BUILDS = 50_000

export type DiscStats = {
  id: string
  stats: Record<string, number>
}

export interface BuildResult {
  value: number
  // lightConeId: string
  discIds: Record<DiscSlotKey, string>
}
export function combineStats(...stats: Stats[]) {
  const total: Stats = {}
  stats.forEach((s) =>
    Object.entries(s).forEach(([k, v]) => {
      total[k] = (total[k] ?? 0) + v
    })
  )
  return total
}
export function convertDiscToStats(disc: ICachedDisc): DiscStats {
  const { id, mainStatKey, level, rarity, setKey, substats } = disc
  return {
    id,
    stats: {
      [mainStatKey]: getDiscMainStatVal(rarity, mainStatKey, level),
      ...Object.fromEntries(
        substats.map(({ key, upgrades }) => [
          key,
          getDiscSubStatBaseVal(key, rarity) * upgrades,
        ])
      ),
      [setKey]: 1,
    },
  }
}
