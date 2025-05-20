import type {
  AttributeKey,
  BaseStatKey,
  CharacterKey,
  CharacterRarityKey,
  FactionKey,
  SkillKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export type CharacterDatum = {
  id: string
  rarity: CharacterRarityKey
  attribute: AttributeKey
  specialty: SpecialityKey
  faction: FactionKey
  stats: {
    atk_base: number
    atk_growth: number
    def_base: number
    def_growth: number
    hp_base: number
    hp_growth: number
    anomMas: number
    anomProf: number
    impact: number
    enerRegen: number
  }
  promotionStats: Array<{ hp: number; atk: number; def: number }>
  coreStats: Array<Partial<Record<BaseStatKey, number>>>
  skillParams: Record<SkillKey, Record<string, SkillParam[]>>
  coreParams: {
    core: number[]
    ability: number[]
  }[]
  mindscapeParams: number[][]
}
export type SkillParam = {
  DamagePercentage: number
  DamagePercentageGrowth: number
  StunRatio: number
  StunRatioGrowth: number
  SpRecovery: number
  SpRecoveryGrowth: number
  FeverRecovery: number
  FeverRecoveryGrowth: number
  AttributeInfliction: number
}

export function getCharStat(ck: CharacterKey) {
  return allStats.char[ck]
}
