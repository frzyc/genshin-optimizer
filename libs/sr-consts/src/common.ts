export const allRarityKeys = [5, 4, 3, 2, 1] as const
export type RarityKey = (typeof allRarityKeys)[number]

export const allStatKeys = [
  'spd',
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'crit_',
  'crit_dmg_',
  'taunt',
  'brEff_',
  'eff_',
  'eff_res_',
  'enerRegen_',
  'heal_',
  'physical_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'wind_dmg_',
  'lightning_dmg_',
  'quantum_dmg_',
  'imaginary_dmg_',
] as const
export type StatKey = (typeof allStatKeys)[number]

export const allAscensionKeys = [0, 1, 2, 3, 4, 5, 6] as const
export type AscensionKey = (typeof allAscensionKeys)[number]
