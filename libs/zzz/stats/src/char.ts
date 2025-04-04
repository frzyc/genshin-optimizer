import type {
  AttributeKey,
  BaseStatKey,
  CharacterKey,
  CharacterRarityKey,
  FactionKey,
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
}

export function getCharStat(ck: CharacterKey) {
  return allStats.char[ck]
}
