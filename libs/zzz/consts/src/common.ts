import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscMainStatKeys, allDiscSubStatKeys } from './disc'

export const otherStatKeys = [
  // Used by calc, likely will be bundled into pando
  'charLvl',
  'enemyDef', // Enemy DEF
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
  'uncond_hp',
  'uncond_def',
  'uncond_atk',
  'uncond_hp_',
  'uncond_def_',
  'uncond_atk_',
] as const

export const allStatKeys = Array.from(
  new Set([...allDiscMainStatKeys, ...allDiscSubStatKeys, ...otherStatKeys])
)
export type StatKey = (typeof allStatKeys)[number]

const allElementalKeys = [
  'electric',
  'fire',
  'ice',
  'frost',
  'physical',
  'ether',
] as const
export type ElementalKey = (typeof allElementalKeys)[number]

export const allAttributeDamageKeys = [
  'electric_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'frost_dmg_',
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
  enemyRes_: 'Enemy Resistance',
  enemyResRed_: 'Enemy Resistance Reduction',
  enemyResIgn_: 'Enemy Resistance Ignore',

  uncond_hp: 'Unconditional HP',
  uncond_def: 'Unconditional DEF',
  uncond_atk: 'Unconditional ATK',
  uncond_hp_: 'Unconditional HP%',
  uncond_def_: 'Unconditional DEF%',
  uncond_atk_: 'Unconditional ATK%',
}

const elementalData: Record<ElementalKey, string> = {
  electric: 'Electric',
  fire: 'Fire',
  ice: 'Ice',
  frost: 'Frost',
  physical: 'Physical',
  ether: 'Ether',
} as const

Object.entries(elementalData).forEach(([e, name]) => {
  statKeyTextMap[`${e}_dmg_`] = `${name} DMG Bonus`
})
