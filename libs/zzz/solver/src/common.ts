import {
  getDiscMainStatVal,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'

export const MAX_BUILDS = 50_000

export type DiscStats = {
  id: string
  stats: Record<string, number>
}

export type BaseStats = Record<string, number>

export type Constraints = Record<string, { value: number; isMax: boolean }>

export interface BuildResult {
  value: number
  // lightConeId: string
  discIds: Record<DiscSlotKey, string>
}

export function convertDiscToStats(disc: ICachedDisc): DiscStats {
  const { id, mainStatKey, level, rarity, setKey, substats } = disc
  return {
    id,
    stats: {
      [mainStatKey]: getDiscMainStatVal(rarity, mainStatKey, level),
      ...Object.fromEntries(
        substats
          .filter(({ key, value }) => key && value)
          .map(({ key, value }) => [key, value])
      ),
      [setKey]: 1,
    },
  }
}
