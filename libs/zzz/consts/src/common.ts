import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscMainStatKeys, allDiscSubStatKeys } from './disc'

export const otherStatKeys = [
  // Used by calc, likely will be bundled into pando
  'charLvl',
  'enemyDef', // Enemy DEF
  'enemyDefRed_', // Enemy DEF shred
  'enemyRes_', // Enemy Resistance
  'enemyResRed_', // Enemy Resistance Reduction
  'enemyResIgn_', // Enemy Resistance Ignore
  'common_dmg_', // Common DMG bonus
  'dmg_', // Bonus DMG

  // Other stats
  'impact', // flat impact on character
  'anomMas', // flat Anomally Mastery on character
  'shield_', // Shield Effect
  'enerRegen',
] as const

export const unCondKeys = [
  'cond_hp',
  'cond_def',
  'cond_atk',
  'cond_hp_',
  'cond_def_',
  'cond_atk_',
  'cond_anomMas',
  'cond_anomMas_',
] as const

export const allStatKeys = Array.from(
  new Set([...allDiscMainStatKeys, ...allDiscSubStatKeys, ...otherStatKeys])
)
export type StatKey = (typeof allStatKeys)[number]

// TODO: consolidate this and StatKey to the same type.
// Can't do it now because StatKey contains 'charLvl' and other random things that
// don't index into Pando's own.char.initial
const extraPandoStatKeys = ['impact', 'anomMas', 'dmg_', 'shield_'] as const
export const allPandoStatKeys = Array.from(
  new Set([
    ...allDiscMainStatKeys,
    ...allDiscSubStatKeys,
    ...extraPandoStatKeys,
  ])
)
export type PandoStatKey = (typeof allPandoStatKeys)[number]

export const allAttributeKeys = [
  'electric',
  'fire',
  'ice',
  'physical',
  'ether',
] as const
export type AttributeKey = (typeof allAttributeKeys)[number]

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
  anomMas_base: 'Base Anomaly Mastery',
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
  enerRegen: 'Energy Regen',
  base_enerRegen: 'Base Energy Regen',
  impact_: 'Impact',
  impact: 'Impact',
  daze_: 'Daze',
  shield_: 'Shield Effect',
  anomMas: 'Anomaly Mastery',
  anomMas_: 'Anomaly Mastery',
  anomProf: 'Anomaly Proficiency',
  anomBuild_: 'Anomaly Buildup',
  ...objKeyMap(allAnomalyDmgKeys, (dmg_) => `${dmg_} DMG Bonus`),
  common_dmg_: 'DMG Bonus',
  dmg_: 'DMG Bonus',
  charLvl: 'Character Level',
  enemyDef: 'Enemy DEF',
  enemyDefRed_: 'Enemy DEF shred',
  enemyRes_: 'Enemy Resistance',
  enemyResRed_: 'Enemy Resistance Reduction',
  enemyResIgn_: 'Enemy Resistance Ignore',

  initial_hp: 'Initial HP',
  initial_def: 'Initial DEF',
  initial_atk: 'Initial ATK',
  final_hp: 'Final HP',
  final_def: 'Final DEF',
  final_atk: 'Final ATK',
  final_anomMas: 'Final Anomaly Mastery',
  cond_hp: 'Combat HP',
  cond_def: 'Combat DEF',
  cond_atk: 'Combat ATK',
  cond_hp_: 'Combat HP%',
  cond_def_: 'Combat DEF%',
  cond_atk_: 'Combat ATK%',
  cond_anomMas_: 'Combat Anomaly Mastery%',
  cond_anomMas: 'Combat Anomaly Mastery',

  // Formula display stuff
  crit_mult_: 'CRIT Multiplier',
  dmg_mult_: 'DMG Multiplier',
  def_mult_: 'DEF Multiplier',
  res_mult_: 'Resistance Multiplier',
  base: 'Base Damage',
  stun_: 'Stun DMG Multiplier',
  unstun_: 'Unstun DMG Multiplier',
  defRed_: 'Defense Reduction',
  res_: 'Resistance',
  resRed_: 'Resistance Reduction',
}

export const elementalData: Record<AttributeKey, string> = {
  electric: 'Electric',
  fire: 'Fire',
  ice: 'Ice',
  physical: 'Physical',
  ether: 'Ether',
} as const

Object.entries(elementalData).forEach(([e, name]) => {
  statKeyTextMap[`${e}_dmg_`] = `${name} DMG Bonus`
})

export const rarityColor = {
  S: 'rankS',
  A: 'rankA',
  B: 'rankB',
} as const

export const allRaritykeys = ['S', 'A', 'B'] as const
export type Raritykey = (typeof allRaritykeys)[number]
export const skillLimits = [1, 3, 5, 7, 9, 12] as const
export const coreLimits = [0, 1, 2, 3, 4, 6] as const

// Referred to as "promotions" for characters, and "modifications" for wengines
export const allMilestoneKeys = [0, 1, 2, 3, 4, 5] as const
export type MilestoneKey = (typeof allMilestoneKeys)[number]
