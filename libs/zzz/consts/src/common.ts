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
  'anom_crit_', // Anomaly CRIT Rate
  'anom_crit_dmg_', // Anomaly CRIT DMG
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

export const baseStatKeys = [
  'atk',
  'def',
  'hp',
  'impact',
  'crit_',
  'crit_dmg_',
  'pen_',
  'anomProf',
  'anomMas',
  'enerRegen',
] as const
export type BaseStatKey = (typeof baseStatKeys)[number]

// TODO: consolidate this and StatKey to the same type.
// Can't do it now because StatKey contains 'charLvl' and other random things that
// don't index into Pando's own.char.initial
const extraPandoStatKeys = [
  'impact',
  'anomMas',
  'dmg_',
  'shield_',
  'dazeInc_',
] as const
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
  sheerForce: 'Sheer Force',
  def: 'DEF',
  def_: 'DEF',
  pen: 'PEN',
  pen_: 'PEN Ratio',
  crit_: 'CRIT Rate',
  crit_dmg_: 'CRIT DMG',
  sheer_dmg_: 'Sheer DMG',
  enerRegen_: 'Energy Regen',
  enerRegen: 'Energy Regen',
  base_enerRegen: 'Base Energy Regen',
  impact_: 'Impact',
  impact: 'Impact',
  dazeInc_: 'Daze Increase',
  shield_: 'Shield Effect',
  anomMas: 'Anomaly Mastery',
  anomMas_: 'Anomaly Mastery',
  anomProf: 'Anomaly Proficiency',
  anomBuildup_: 'Anomaly Buildup',
  anom_crit_: 'Anomaly CRIT Rate',
  anom_crit_dmg_: 'Anomaly CRIT DMG',
  anom_mv_mult_: 'Anomaly Damage Multiplier Increase',
  addl_disorder_: 'Additional Disorder Multiplier',
  anom_base_: 'Anomaly Base DMG Increase',
  anom_flat_dmg: 'Anomaly Flat DMG Bonus',
  ...objKeyMap(allAnomalyDmgKeys, (dmg_) => `${dmg_} DMG Bonus`),
  common_dmg_: 'DMG Bonus',
  dmg_: 'DMG Bonus',
  flat_dmg: 'Flat DMG Bonus',
  buff_: 'Buff Bonus',
  dmg_red_: 'DMG Taken Reduction',
  charLvl: 'Character Level',
  enemyDef: 'Enemy DEF',
  defRed_: 'Enemy DEF Reduction',
  enemyRes_: 'Enemy Resistance',
  enemyResRed_: 'Enemy Resistance Reduction',
  enemyResIgn_: 'Enemy Resistance Ignore',
  anomBuildupRes_: 'Enemy Anomaly Buildup RES',
  dazeRes_: 'Enemy Daze RES',
  dazeRed_: 'Enemy Daze Taken Reduction',
  dmgInc_: 'Enemy DMG Taken Increase',

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
  anomaly_crit_mult_: 'Anomaly CRIT Multiplier',
  dmg_mult_: 'DMG Multiplier',
  def_mult_: 'DEF Multiplier',
  res_mult_: 'Resistance Multiplier',
  dmg_taken_mult_: 'Enemy DMG Taken Multiplier',
  base: 'Base Damage',
  enemyAnomBuildupRes_mult_: 'Enemy Anomaly Buildup RES Multiplier',
  anomBuildup_mult_: 'Anomaly Buildup Bonus Multiplier',
  anomMas_mult_: 'Anomaly Mastery Bonus',
  daze_mult_: 'Daze Multiplier',
  enemyDazeRes_mult_: 'Enemy Daze Resistance Multiplier',
  enemyDazeTaken_mult_: 'Enemy Daze Taken Multiplier',
  stun_: 'Stun DMG Multiplier',
  unstun_: 'Unstun DMG Multiplier',
  res_: 'Resistance',
  resRed_: 'Resistance Reduction',
  sheer_mult_: 'Sheer DMG Multiplier',
  mv_mult_: 'DMG Multiplier Increase',
  buff_mult_: 'Buff Multiplier',
  anom_base_mult_: 'Anomaly Base DMG Multiplier',
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
export const potentialLimits = [0, 1, 2, 3, 4, 5, 6] as const

// Referred to as "promotions" for characters, and "modifications" for wengines
export const allMilestoneKeys = [0, 1, 2, 3, 4, 5] as const
export type MilestoneKey = (typeof allMilestoneKeys)[number]
