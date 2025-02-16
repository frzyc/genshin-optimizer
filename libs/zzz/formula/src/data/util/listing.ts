import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'

export const stats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'impact',
  'impact_',
  'crit_',
  'crit_dmg_',
  'pen_',
  'pen',
  'enerRegen',
  'enerRegen_',
  'anomProf',
  'anomProf_',
  'anomMas',
  'anomMas_',
  'dmg_',
  'resIgn_',
  'shield_',
] as const

export const attributes = [
  'fire',
  'electric',
  'ice',
  'physical',
  'ether',
] as const

export const damageTypes = [
  'basic',
  'dodge', // Dash Attacks
  'dodgeCounter',
  'special',
  'chain',
  'ult',
  'assist',
  'anomaly',
  'additional', // rule 7
  'elemental',
] as const

export const sheets = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allWengineKeys,
  ...allDiscSetKeys,
  'char',
  'wengine',
  'disc',
  'dyn',
  'enemy',
  'custom',
] as const

export const members = [...allCharacterKeys] as const
export type Stat = (typeof stats)[number]
export type Attribute = (typeof attributes)[number]
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
