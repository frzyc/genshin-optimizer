import { isPercentStat } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  CharacterRarityKey,
  ElementalKey,
  StatKey,
} from '@genshin-optimizer/zzz/consts'
import { readHakushinJSON } from '../../util'
import {
  attributeMap,
  characterIdMap,
  characterRarityMap,
  coreStatMap,
} from './consts'
const SCALING = 10000
type CharacterRawData = {
  id: number
  Rarity: number
  ElementType: Record<string, string>
  Stats: {
    Attack: 95
    AttackGrowth: 54230
    Defence: 49
    DefenceGrowth: 66882
    HpGrowth: 818426
    HpMax: 603

    Crit: 500
    CritDamage: 5000
    CritDmgRes: 0
    CritRes: 0

    ElementAbnormalPower: 94 // Anomaly Mastery
    ElementMystery: 93 // Anomaly Proficiency

    Luck: 10
    PenDelta: 0 // pen
    PenRate: 0 // Pen ratio
    SpBarPoint: 120
    SpRecover: 120 // Energy Regen
  }
  Level: Record<
    string,
    {
      HpMax: 414
      Attack: 34
      Defence: 34
      LevelMax: 20
      LevelMin: 10
    }
  >
  ExtraLevel: Record<
    string,
    {
      MaxLevel: 25
      Extra: {
        '12101': {
          Prop: 12101
          Name: 'Base ATK'
          Format: '{0:0.#}'
          Value: 25
        }
        '12201': {
          Prop: 12201
          Name: 'Impact'
          Format: '{0:0.#}'
          Value: 6
        }
      }
    }
  >
}
export type CharacterData = {
  rarity: CharacterRarityKey
  element: ElementalKey
  stats: {
    atk_base: number
    atk_growth: number
    def_base: number
    def_growth: number
    hp_base: number
    hp_growth: number
    anomMas: number
    anomProf: number
  }
  levelStats: Array<{ hp: number; atk: number; def: number }>
  coreStats: Array<Record<StatKey, number>>
}
export const charactersDetailedJSONData = Object.fromEntries(
  Object.entries(characterIdMap).map(([id, name]) => {
    const raw = JSON.parse(
      readHakushinJSON(`character/${id}.json`)
    ) as CharacterRawData
    const data: CharacterData = {
      rarity: characterRarityMap[raw.Rarity],
      element: attributeMap[Object.keys(raw.ElementType)[0] as any],
      stats: {
        atk_base: raw.Stats.Attack,
        atk_growth: raw.Stats.AttackGrowth / SCALING,
        def_base: raw.Stats.Defence,
        def_growth: raw.Stats.DefenceGrowth / SCALING,
        hp_base: raw.Stats.HpMax,
        hp_growth: raw.Stats.HpGrowth / SCALING,
        anomMas: raw.Stats.ElementAbnormalPower,
        anomProf: raw.Stats.ElementMystery,
      },
      levelStats: Object.values(raw.Level).map(
        ({ HpMax, Attack, Defence }) => ({
          hp: HpMax,
          atk: Attack,
          def: Defence,
        })
      ),
      coreStats: Object.values(raw.ExtraLevel).map(
        ({ Extra }) =>
          Object.fromEntries(
            Object.values(Extra).map(({ Name, Value }) => [
              coreStatMap[Name],
              isPercentStat(coreStatMap[Name]) ? Value / SCALING : Value,
            ])
          ) as Record<StatKey, number>
      ),
    }
    return [name, data] as const
  })
) as Record<CharacterKey, CharacterData>
