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
  'shield_'
] as const

export const attributes = [
  'fire',
  'electric',
  'ice',
  'frost',
  'physical',
  'ether',
] as const

export const damageTypes = [
  'basic',
  'dodge',
  'special',
  'chain',
  'ult',
  'assist',
  'anomaly',
  'additional',
  'elemental',
] as const

export const entryTypes = [
  'own',
  'enemy',
  'team',
  'target',
  'teamBuff',
  'notOwnBuff',
  'enemyDeBuff', // Ends with 'Buff' so `Calculator` can pick up on this tag
  'display', // Display-only, not participating in any buffs
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
export const presets = [
  'preset0',
  'preset1',
  'preset2',
  'preset3',
  'preset4',
  'preset5',
  'preset6',
  'preset7',
  'preset8',
  'preset9',
] as const

export const members = [...allCharacterKeys] as const
export type Stat = (typeof stats)[number]
export type Attribute = (typeof attributes)[number]
export type DamageType = (typeof damageTypes)[number]
export type EntryType = (typeof entryTypes)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
export type Preset = (typeof presets)[number]

export function isMember(x: string): x is Member {
  return members.includes(x as Member)
}
export function isSheet(x: string): x is Sheet {
  return sheets.includes(x as Sheet)
}
