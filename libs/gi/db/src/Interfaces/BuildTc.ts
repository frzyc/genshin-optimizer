import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  AscensionKey,
  MainStatKey,
  RefinementKey,
  SubstatKey,
  SubstatTypeKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'
export type BuildTcArtifactSlot = {
  level: number
  statKey: MainStatKey
  rarity: ArtifactRarity
}
export type BuildTc = {
  name: string
  description: string
  character?: Omit<ICharacter, 'key'>
  weapon: {
    key: WeaponKey
    level: number
    ascension: AscensionKey
    refinement: RefinementKey
  }
  artifact: {
    slots: Record<ArtifactSlotKey, BuildTcArtifactSlot>
    substats: {
      type: SubstatTypeKey
      stats: Record<SubstatKey, number>
      rarity: ArtifactRarity
    }
    sets: Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
  }
  optimization: {
    distributedSubstats: number
    maxSubstats: Record<SubstatKey, number>
  }
}
