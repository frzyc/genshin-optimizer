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
  }
}
