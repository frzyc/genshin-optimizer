import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscMainStatKeys, allDiscSubStatKeys } from './disc'

export const otherStatKeys = [
  // Used by calc, likely will be bundled into pando
  'charLvl',
  'enemyDef', // Enemy DEF
  'enemyDefRed', // Enemy DEF shred
  'enemyRes_', // Enemy Resistance
  'enemyResRed_', // Enemy Resistance Reduction
  'enemyResIgn_', // Enemy Resistance Ignore
  'dmg_', // Bonus DMG

  // Other stats
  'impact', // flat impact on character
  'anomMas', // flat Anomally Mastery on character
  'shield_', // Shield Effect
] as const

export const unCondKeys = [
  'cond_hp',
  'cond_def',
  'cond_atk',
  'cond_hp_',
  'cond_def_',
  'cond_atk_',
] as const

export const allStatKeys = Array.from(
  new Set([...allDiscMainStatKeys, ...allDiscSubStatKeys, ...otherStatKeys])
)
export type StatKey = (typeof allStatKeys)[number]

const allElementalKeys = [
  'electric',
  'fire',
  'ice',
  'physical',
  'ether',
] as const
export type ElementalKey = (typeof allElementalKeys)[number]

export const allAttributeDamageKeys = [
  'electric_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'physical_dmg_',
  'ether_dmg_',
] as const
export type AttributeDamageKey = (typeof allAttributeDamageKeys)[number]

export const allAnomalyDmgKeys = [
  'burn',
  'shock',
  'corruption',
  'shatter',
  'assault',
] as const
export type AnomalyDamageKey = (typeof allAnomalyDmgKeys)[number]

export const statKeyTextMap: Partial<Record<string, string>> = {
  hp_base: 'Base HP',
  atk_base: 'Base ATK',
  def_base: 'Base DEF',
  hp: 'HP',
  hp_: 'HP',
  atk: 'ATK',
  atk_: 'ATK',
  def: 'DEF',
  def_: 'DEF',
  pen: 'PEN',
  pen_: 'PEN Ratio',
  crit_: 'CRIT Rate',
  crit_dmg_: 'CRIT DMG',
  enerRegen_: 'Energy Regen',
  impact_: 'Impact',
  anomMas_: 'Anomaly Mastery',
  anomProf: 'Anomaly Proficiency',
  ...objKeyMap(allAnomalyDmgKeys, (dmg_) => `${dmg_} DMG Bonus`),
  dmg_: 'DMG Bonus',
  charLvl: 'Character Level',
  enemyDef: 'Enemy DEF',
  enemyDefRed: 'Enemy DEF shred',
  enemyRes_: 'Enemy Resistance',
  enemyResRed_: 'Enemy Resistance Reduction',
  enemyResIgn_: 'Enemy Resistance Ignore',

  initial_hp: 'Initial HP',
  initial_def: 'Initial DEF',
  initial_atk: 'Initial ATK',
  final_hp: 'Final HP',
  final_def: 'Final DEF',
  final_atk: 'Final ATK',
  cond_hp: 'Conditional HP',
  cond_def: 'Conditional DEF',
  cond_atk: 'Conditional ATK',
  cond_hp_: 'Conditional HP%',
  cond_def_: 'Conditional DEF%',
  cond_atk_: 'Conditional ATK%',
}

const elementalData: Record<ElementalKey, string> = {
  electric: 'Electric',
  fire: 'Fire',
  ice: 'Ice',
  physical: 'Physical',
  ether: 'Ether',
} as const

Object.entries(elementalData).forEach(([e, name]) => {
  statKeyTextMap[`${e}_dmg_`] = `${name} DMG Bonus`
})
