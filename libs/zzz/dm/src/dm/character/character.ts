import { isPercentStat, objMap } from '@genshin-optimizer/common/util'
import type { FactionKey } from '@genshin-optimizer/zzz/consts'
import {
  type AttributeKey,
  type CharacterKey,
  type CharacterRarityKey,
  type SpecialityKey,
  allCharacterKeys,
} from '@genshin-optimizer/zzz/consts'
import { readHakushinJSON } from '../../util'
import type { HakushinSkillKey } from './consts'
import {
  attributeMap,
  characterIdMap,
  characterRarityMap,
  coreStatMap,
  factionMap,
  specialityMap,
} from './consts'
const PERCENT_SCALING = 10000
const FLAT_SCALING = 100
type CharacterRawData = {
  id: number
  Icon: string
  Name: string
  Rarity: number
  ElementType: Record<string, string> // index, Attribute
  WeaponType: Record<string, string> // index, Specialty
  Camp: Record<string, string> // index, Faction
  PartnerInfo: {
    Birthday: string
    FullName: string
  }
  Stats: {
    Attack: 95
    AttackGrowth: 54230
    Defence: 49
    DefenceGrowth: 66882
    HpGrowth: 818426
    HpMax: 603

    BreakStun: number // Base Impact

    Crit: 500
    CritDamage: 5000
    CritDmgRes: 0
    CritRes: 0

    ElementAbnormalPower: 94 // Anomaly Mastery
    ElementMystery: 93 // Anomaly Proficiency

    Luck: 10
    PenDelta: 0 // pen
    PenRate: 0 // Pen ratio
    SpBarPoint: 120 // Max energy
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
  Skill: Record<
    HakushinSkillKey,
    {
      Description: Array<{
        Name: string
        Desc?: string
        Param?: Array<{
          Name: string
          Desc: string
          Param?: Record<
            string,
            {
              Main: number
              Growth: number
              Format: '%'
              DamagePercentage: number
              DamagePercentageGrowth: number
              StunRatio: number
              StunRatioGrowth: number
              SpRecovery: number
              SpRecoveryGrowth: number
              FeverRecovery: number
              FeverRecoveryGrowth: number
              AttributeInfliction: number
              SpConsume: number
              AttackData: []
            }
          >
        }>
      }>
      Material: Record<
        number,
        { 10?: number; 100112?: number; 100941?: number }
      >
    }
  >
  SkillList: Record<
    string,
    {
      Name: 'Special Attack: Fork Lightning'
      Desc: '<IconMap:Icon_Special>'
      ElementType: 203
      HitType: 101
    }
  >
  Passive: {
    Level: Record<
      '1' | '2' | '3' | '4' | '5' | '6' | '7',
      {
        Level: '1' | '2' | '3' | '4' | '5' | '6' | '7'
        Name: [string, string]
        Description: [string, string]
      }
    >
    Material: Record<
      '1' | '2' | '3' | '4' | '5' | '6',
      { 10?: number; 100112?: number; 100941?: number }
    >
  }
  Talent: Record<
    '1' | '2' | '3' | '4' | '5' | '6',
    {
      Level: '1' | '2' | '3' | '4' | '5' | '6'
      Name: string
      Desc: string
      Desc2: string
    }
  >
}
export type CharacterData = {
  id: string
  icon: string
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
  coreStats: Array<
    Partial<Record<(typeof coreStatMap)[keyof typeof coreStatMap], number>>
  >
  skills: CharacterRawData['Skill']
  skillList: CharacterRawData['SkillList']
  cores: CharacterRawData['Passive']
  mindscapes: CharacterRawData['Talent']
  fullname: string
  name: string
}
export const charactersDetailedJSONData = Object.fromEntries(
  Object.entries(characterIdMap)
    .filter(([_, name]) => allCharacterKeys.includes(name as CharacterKey))
    .map(([id, name]) => {
      const raw = JSON.parse(
        readHakushinJSON(`character/${id}.json`)
      ) as CharacterRawData
      // Not all agents have this info, or it is hidden for some reason
      const fullname =
        raw.PartnerInfo.FullName === undefined ||
        raw.PartnerInfo.FullName === '...'
          ? raw.Name
          : raw.PartnerInfo.FullName
      const data: CharacterData = {
        id: id,
        icon: raw.Icon,
        rarity: characterRarityMap[raw.Rarity],
        attribute: attributeMap[Object.keys(raw.ElementType)[0] as any],
        specialty: specialityMap[Object.keys(raw.WeaponType)[0] as any],
        faction: factionMap[Object.keys(raw.Camp)[0] as any],
        fullname,
        name: raw.Name,
        stats: {
          atk_base: raw.Stats.Attack,
          atk_growth: raw.Stats.AttackGrowth / PERCENT_SCALING,
          def_base: raw.Stats.Defence,
          def_growth: raw.Stats.DefenceGrowth / PERCENT_SCALING,
          hp_base: raw.Stats.HpMax,
          hp_growth: raw.Stats.HpGrowth / PERCENT_SCALING,
          anomMas: raw.Stats.ElementAbnormalPower,
          anomProf: raw.Stats.ElementMystery,
          impact: raw.Stats.BreakStun,
          enerRegen: raw.Stats.SpRecover / FLAT_SCALING,
        },
        promotionStats: Object.values(raw.Level).map(
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
                isPercentStat(coreStatMap[Name])
                  ? Value / PERCENT_SCALING
                  : Value,
              ])
            ) as Partial<
              Record<(typeof coreStatMap)[keyof typeof coreStatMap], number>
            >
        ),
        skills: objMap(raw.Skill, (skill) => ({
          ...skill,
          Description: skill.Description.map((desc) => {
            if ('Param' in desc) {
              return {
                ...desc,
                Param: desc?.Param?.map((param) => {
                  if ('Param' in param) {
                    return {
                      ...param,
                      Param: objMap(param.Param, (param2) => ({
                        ...param2,
                        Main: param2.Main / FLAT_SCALING,
                        Growth: param2.Growth / PERCENT_SCALING,
                        DamagePercentage:
                          param2.DamagePercentage / PERCENT_SCALING,
                        DamagePercentageGrowth:
                          param2.DamagePercentageGrowth / PERCENT_SCALING,
                        StunRatio: param2.StunRatio / PERCENT_SCALING,
                        StunRatioGrowth:
                          param2.StunRatioGrowth / PERCENT_SCALING,
                        SpRecovery: param2.SpRecovery / FLAT_SCALING,
                        SpRecoveryGrowth:
                          param2.SpRecoveryGrowth / PERCENT_SCALING,
                        FeverRecovery: param2.FeverRecovery / FLAT_SCALING,
                        FeverRecoveryGrowth:
                          param2.FeverRecoveryGrowth / PERCENT_SCALING,
                        AttributeInfliction:
                          param2.AttributeInfliction / FLAT_SCALING,
                        SpConsume: param2.SpConsume / FLAT_SCALING,
                      })),
                    }
                  }
                  return param
                }),
              }
            }
            return desc
          }),
        })),
        skillList: raw.SkillList,
        cores: raw.Passive,
        mindscapes: raw.Talent,
      }
      return [name, data] as const
    })
) as Record<CharacterKey, CharacterData>
