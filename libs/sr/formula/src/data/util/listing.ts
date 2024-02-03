import type { ElementalTypeKey } from '@genshin-optimizer/sr/consts'
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
  'brEff_',
  'eff_',
  'eff_res_',
  'enerRegen_',
  'heal_',
  'dmg_',
  'resPen_',
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

export const entryTypes = [
  'self',
  'teamBuff',
  'enemy',
  'team',
  'target',
] as const
export const srcs = [
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
export const members = ['member0', 'member1', 'member2', 'member3'] as const
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

export type Stat = (typeof stats)[number]
export type BonusAbility = (typeof bonusAbilities)[number]
export type StatBoost = (typeof statBoosts)[number]
export type ElementalType = (typeof elementalTypes)[number]
export type DamageType = (typeof damageTypes)[number]
export type EntryType = (typeof entryTypes)[number]
export type Source = (typeof srcs)[number]
export type Member = (typeof members)[number]
export type Preset = (typeof presets)[number]

export const TypeKeyToListingType: Record<ElementalTypeKey, ElementalType> = {
  Physical: 'physical',
  Quantum: 'quantum',
  Lightning: 'lightning',
  Ice: 'ice',
  Wind: 'wind',
  Fire: 'fire',
  Imaginary: 'imaginary',
}
