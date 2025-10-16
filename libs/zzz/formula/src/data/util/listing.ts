import {
  allAttributeKeys,
  allCharacterKeys,
  allDiscSetKeys,
  allFactionKeys,
  allSpecialityKeys,
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
  'anomBuildup_',
  'anom_crit_',
  'anom_crit_dmg_',
  'anom_base_',
  'dmg_',
  'common_dmg_',
  'buff_',
  'defIgn_',
  'resIgn_',
  'shield_',
  'dazeInc_',
  'dazeRed_',
  'dmg_red_',
  'sheerForce',
  'sheer_dmg_',
  'flat_dmg',
  'anom_flat_dmg',
  'addl_disorder_',
] as const

export const flatAndPercentStats = [
  'atk',
  'def',
  'hp',
  'impact',
  'anomProf',
  'anomMas',
  'enerRegen',
] as const
export const nonFlatAndPercentStats = stats.filter(
  (stat) =>
    !flatAndPercentStats.flatMap((stat) => [stat, `${stat}_`]).includes(stat)
)

export const attributes = [...allAttributeKeys] as const

export const damageTypes = [
  'basic',
  'dash',
  'dodgeCounter',
  'special',
  'exSpecial',
  'chain',
  'ult',
  'quickAssist',
  'defensiveAssist',
  'evasiveAssist',
  'assistFollowUp',
  'anomaly',
  'disorder',
  'aftershock',
  'elemental',
  'sheer',
] as const

export const skillTypes = [
  'basicSkill',
  'dodgeSkill',
  'specialSkill',
  'chainSkill',
  'assistSkill',
] as const

export const commonSheets = ['enemy', 'anomaly'] as const

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
  'custom',
  ...commonSheets,
] as const

export const members = [...allCharacterKeys] as const

export const specialties = [...allSpecialityKeys] as const

export const factions = [...allFactionKeys] as const

export type Stat = (typeof stats)[number]
export type Attribute = (typeof attributes)[number]
export type DamageType = (typeof damageTypes)[number]
export type SkillType = (typeof skillTypes)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
export type Src = Member
export type Dst = Member | null
export type Specialty = (typeof specialties)[number]
export type Faction = (typeof factions)[number]

export function isMember(x: string): x is Member {
  return members.includes(x as Member)
}
export function isSheet(x: string): x is Sheet {
  return sheets.includes(x as Sheet)
}
