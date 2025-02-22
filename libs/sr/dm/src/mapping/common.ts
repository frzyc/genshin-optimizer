import type { StatKey } from '@genshin-optimizer/sr/consts'

export const allStatDMKeys = [
  'HPDelta',
  'AttackDelta',
  'DefenceDelta',
  'HPAddedRatio',
  'AttackAddedRatio',
  'DefenceAddedRatio',
  'SpeedDelta',
  'SpeedAddedRatio',
  'CriticalChanceBase',
  'CriticalDamageBase',
  'StatusProbabilityBase',
  'StatusResistanceBase',
  'BreakDamageAddedRatioBase',
  'HealRatioBase',
  'StatusProbabilityBase',
  'SpeedDelta',
  'PhysicalAddedRatio',
  'FireAddedRatio',
  'IceAddedRatio',
  'ThunderAddedRatio',
  'WindAddedRatio',
  'QuantumAddedRatio',
  'ImaginaryAddedRatio',
  'SPRatioBase',
  'AllDamageTypeAddedRatio',
] as const
export type StatDMKey = (typeof allStatDMKeys)[number]

export const statKeyMap: Record<
  Exclude<StatDMKey, 'AllDamageTypeAddedRatio'>,
  StatKey
> = {
  HPDelta: 'hp',
  HPAddedRatio: 'hp_',
  AttackDelta: 'atk',
  AttackAddedRatio: 'atk_',
  DefenceDelta: 'def',
  DefenceAddedRatio: 'def_',
  SpeedDelta: 'spd',
  SpeedAddedRatio: 'spd_',
  CriticalChanceBase: 'crit_',
  CriticalDamageBase: 'crit_dmg_',
  HealRatioBase: 'heal_',

  PhysicalAddedRatio: 'physical_dmg_',
  FireAddedRatio: 'fire_dmg_',
  IceAddedRatio: 'ice_dmg_',
  WindAddedRatio: 'wind_dmg_',
  ThunderAddedRatio: 'lightning_dmg_',
  QuantumAddedRatio: 'quantum_dmg_',
  ImaginaryAddedRatio: 'imaginary_dmg_',

  StatusProbabilityBase: 'eff_',
  StatusResistanceBase: 'eff_res_',
  BreakDamageAddedRatioBase: 'brEffect_',

  SPRatioBase: 'enerRegen_',
} as const
