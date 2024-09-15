import type {
  AscensionKey,
  LightConeKey,
  RelicMainStatKey,
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
  RelicSubstatTypeKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'

export const minTotalStatKeys = [
  'atk',
  'hp',
  'def',
  'spd',
  'crit_',
  'crit_dmg_',
  'eff_',
  'eff_res_',
  'brEffect_',
] as const
export type MinTotalStatKey = (typeof minTotalStatKeys)[number]

export type BuildTcRelicSlot = {
  level: number
  statKey: RelicMainStatKey
}
export interface IBuildTc {
  name: string
  description: string
  lightCone?: {
    key: LightConeKey
    level: number
    ascension: AscensionKey
    superimpose: SuperimposeKey
  }
  relic: {
    slots: Record<RelicSlotKey, BuildTcRelicSlot>
    substats: {
      type: RelicSubstatTypeKey
      stats: Record<RelicSubStatKey, number>
    }
    sets: Partial<Record<RelicSetKey, 2 | 4>>
  }
  optimization: {
    distributedSubstats: number
    maxSubstats: Record<RelicSubStatKey, number>
    /** NB: this is in total raw value, not substat count
     * This includes stats from other sources
     * e.g. `{eff_: 0.3}`
     */
    minTotal: Partial<Record<MinTotalStatKey, number>>
  }
}
