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
export type ICharTCArtifactSlot = {
  level: number
  statKey: MainStatKey
  rarity: ArtifactRarity
}
export type ICharTC = {
  weapon: {
    key: WeaponKey
    level: number
    ascension: AscensionKey
    refinement: RefinementKey
  }
  artifact: {
    slots: Record<ArtifactSlotKey, ICharTCArtifactSlot>
    substats: {
      type: SubstatTypeKey
      stats: Record<SubstatKey, number>
      rarity: ArtifactRarity
    }
    sets: Partial<Record<ArtifactSetKey, 1 | 2 | 4>>
  }
  optimization: {
    target?: string[]
    distributedSubstats: number
    maxSubstats: Record<SubstatKey, number>
    /** NB: this is in total raw value, not substat count
     * This includes stats from other sources
     * e.g. `{enerRech_: 0.3}`
     */
    minTotal: Partial<
      Record<Exclude<SubstatKey, 'hp_' | 'atk_' | 'def_'>, number>
    >
  }
}
