import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'

const stats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'spd',
  'spd_',
  'crit_',
  'crit_dmg_',
  'brEffect_',
  'eff_',
  'eff_res_',
  'enerRegen_',
  'heal_',
  'dmg_',
  'resPen_',
  'weakness_',
  'brEfficiency_',
] as const

export const bonusAbilities = [
  'bonusAbility1',
  'bonusAbility2',
  'bonusAbility3',
] as const

export const statBoosts = [
  'statBoost1',
  'statBoost2',
  'statBoost3',
  'statBoost4',
  'statBoost5',
  'statBoost6',
  'statBoost7',
  'statBoost8',
  'statBoost9',
  'statBoost10',
] as const

export const elementalTypes = [
  'physical',
  'quantum',
  'lightning',
  'ice',
  'wind',
  'fire',
  'imaginary',
] as const

export const damageTypes = [
  'basic',
  'skill',
  'ult',
  'technique', // MAZE
  'followUp', // insert
  'dot',
  'break', // elementDamage
  'elemental', // pursued
] as const

export const sheets = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allLightConeKeys,
  ...allRelicSetKeys,
  'char',
  'lightCone',
  'relic',
  'dyn',
  'enemy',
  'custom',
] as const

export const members = [...allCharacterKeys] as const
export type Stat = (typeof stats)[number]
export type BonusAbility = (typeof bonusAbilities)[number]
export type StatBoost = (typeof statBoosts)[number]
export type ElementalType = (typeof elementalTypes)[number]
export type DamageType = (typeof damageTypes)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
export type Src = Member | null
export type Dst = Member | null

export function isMember(x: string): x is Member {
  return members.includes(x as Member)
}
export function isSheet(x: string): x is Sheet {
  return sheets.includes(x as Sheet)
}
