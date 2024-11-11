import type {
  CharacterKey,
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
  RelicSubStatKey,
  RelicSubstatTypeKey,
} from '@genshin-optimizer/sr/consts'
import type { ILightCone } from '@genshin-optimizer/sr/srod'

export type BuildTcRelicSlot = {
  level: number
  statKey: RelicMainStatKey
  rarity:RelicRarityKey
}
export type BuildTCLightCone = Omit<ILightCone, 'location' | 'lock'>
export interface IBuildTc {
  name: string
  description: string
  characterKey: CharacterKey
  teamId?: string
  lightCone?: BuildTCLightCone
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
