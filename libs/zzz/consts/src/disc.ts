import type { StatKey } from './common'

export const allDiscSlotKeys = ['1', '2', '3', '4', '5', '6'] as const
export type DiscSlotKey = (typeof allDiscSlotKeys)[number]

// Copied from libs\zzz\dm\src\dm\disc\discKeys.json
export const allDiscSetKeys = [
  'AstralVoice',
  'BranchBladeSong',
  'ChaosJazz',
  'ChaoticMetal',
  'FangedMetal',
  'FreedomBlues',
  'HormonePunk',
  'InfernoMetal',
  'PolarMetal',
  'ProtoPunk',
  'PufferElectro',
  'ShockstarDisco',
  'SoulRock',
  'SwingJazz',
  'ThunderMetal',
  'WoodpeckerElectro',
] as const
export type DiscSetKey = (typeof allDiscSetKeys)[number]

export const allDiscSubStatKeys = [
  'hp',
  'atk',
  'def',
  'hp_',
  'atk_',
  'def_',
  'pen',
  'crit_',
  'crit_dmg_',
  'anomProf',
] as const
export type DiscSubStatKey = (typeof allDiscSubStatKeys)[number]
export const allElementalDmgMainStatKeys = [
  'electric_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'physical_dmg_',
  'ether_dmg_',
] as const
export const allDiscMainStatKeys = [
  'hp',
  'atk',
  'def',
  'hp_',
  'atk_',
  'def_',
  'crit_',
  'crit_dmg_',
  'anomProf', // Anomaly Proficiency
  ...allElementalDmgMainStatKeys,
  'pen_', // PEN Ratio
  'anomMas_', // Anomaly Mastery%
  'impact_', // Impact%
  'enerRegen_', // Energy Regen
] as const

export type DiscMainStatKey = (typeof allDiscMainStatKeys)[number]

export const allDiscRarityKeys = ['S', 'A', 'B'] as const
export type DiscRarityKey = (typeof allDiscRarityKeys)[number]

export const allDiscSetCountKeys = [2, 4] as const
export type DiscSetCountKey = (typeof allDiscSetCountKeys)[number]

export const discMaxLevel: Record<DiscRarityKey, number> = {
  S: 15,
  A: 12,
  B: 9,
} as const

export const discSubstatRollData: Record<
  DiscRarityKey,
  { low: number; high: number; numUpgrades: number }
> = {
  S: { low: 3, high: 4, numUpgrades: 5 },
  A: { low: 2, high: 3, numUpgrades: 4 },
  B: { low: 1, high: 2, numUpgrades: 3 },
} as const

export const discSlotToMainStatKeys: Record<DiscSlotKey, DiscMainStatKey[]> = {
  '1': ['hp'],
  '2': ['atk'],
  '3': ['def'],
  '4': ['hp_', 'atk_', 'def_', 'crit_', 'crit_dmg_', 'anomProf'],
  '5': ['hp_', 'atk_', 'def_', 'pen_', ...allElementalDmgMainStatKeys],
  '6': ['hp_', 'atk_', 'def_', 'anomMas_', 'impact_', 'enerRegen_'],
}

export const allDiscMainSubStatKeys = Array.from(
  new Set([...allDiscSubStatKeys, ...allDiscMainStatKeys] as const)
)
export type DiscMainSubStatKey = (typeof allDiscMainSubStatKeys)[number]

// TODO: use dm values
const subData = {
  hp: { B: 39, A: 79, S: 112 },
  atk: { B: 7, A: 15, S: 19 },
  def: { B: 5, A: 10, S: 15 },
  hp_: { B: 0.01, A: 0.02, S: 0.03 },
  atk_: { B: 0.01, A: 0.02, S: 0.03 },
  def_: { B: 0.016, A: 0.032, S: 0.048 },
  pen: { B: 3, A: 6, S: 9 },
  crit_: { B: 0.008, A: 0.016, S: 0.024 },
  crit_dmg_: { B: 0.016, A: 0.032, S: 0.048 },
  anomProf: { B: 3, A: 6, S: 9 },
} as const
export function getDiscSubStatBaseVal(
  statKey: DiscSubStatKey,
  rarity: DiscRarityKey
) {
  return subData[statKey][rarity]
}

const m123 = { B: 0.1, A: 0.2, S: 0.3 }

// TODO: use dm values across all level
const mainData = {
  atk_: m123,
  hp_: m123,
  def_: { B: 0.16, A: 0.32, S: 0.48 },
  hp: { B: 734, A: 1468, S: 2200 },
  atk: { B: 104, A: 212, S: 316 },
  def: { B: 60, A: 124, S: 184 },
  anomProf: { B: 32, A: 60, S: 92 },
  crit_: { B: 0.08, A: 0.16, S: 0.24 },
  crit_dmg_: { B: 0.16, A: 0.32, S: 0.48 },
  pen_: { B: 0.08, A: 0.16, S: 0.24 },
  electric_dmg_: m123,
  fire_dmg_: m123,
  ice_dmg_: m123,
  physical_dmg_: m123,
  ether_dmg_: m123,
  anomMas_: m123,
  enerRegen_: { B: 0.2, A: 0.4, S: 0.6 },
  impact_: { B: 0.06, A: 0.12, S: 0.18 },
} as const

/**
 * WARN: this only works for fully leveled discs
 */
export function getDiscMainStatVal(
  rarity: DiscRarityKey,
  mainStatKey: DiscMainStatKey,
  _level: number
): number {
  return (mainData as any)[mainStatKey][rarity] ?? 0
}

/**
 * TODO: use dm pipeline
 */
export const disc2pEffect: Record<
  DiscSetKey,
  Partial<Record<StatKey, number>>
> = {
  AstralVoice: { atk: 0.1 },
  BranchBladeSong: { crit_dmg_: 0.16 },
  ChaosJazz: { anomProf: 30 },
  ChaoticMetal: { ether_dmg_: 10 },
  FangedMetal: { physical_dmg_: 0.1 },
  FreedomBlues: { anomProf: 30 },
  HormonePunk: { atk: 0.1 },
  InfernoMetal: { fire_dmg_: 0.1 },
  PolarMetal: { ice_dmg_: 0.1 },
  ProtoPunk: { shield_: 0.15 },
  PufferElectro: { pen_: 0.08 },
  ShockstarDisco: { impact_: 0.06 },
  SoulRock: { def_: 0.16 },
  SwingJazz: { enerRegen_: 0.2 },
  ThunderMetal: { electric_dmg_: 0.1 },
  WoodpeckerElectro: { crit_: 0.08 },
}

// Copied from libs\zzz\dm\src\dm\disc\discNames.json
export const discSetNames: Record<DiscSetKey, string> = {
  WoodpeckerElectro: 'Woodpecker Electro',
  PufferElectro: 'Puffer Electro',
  ShockstarDisco: 'Shockstar Disco',
  FreedomBlues: 'Freedom Blues',
  HormonePunk: 'Hormone Punk',
  SoulRock: 'Soul Rock',
  SwingJazz: 'Swing Jazz',
  ChaosJazz: 'Chaos Jazz',
  ProtoPunk: 'Proto Punk',
  InfernoMetal: 'Inferno Metal',
  ChaoticMetal: 'Chaotic Metal',
  ThunderMetal: 'Thunder Metal',
  PolarMetal: 'Polar Metal',
  FangedMetal: 'Fanged Metal',
  BranchBladeSong: 'Branch & Blade Song',
  AstralVoice: 'Astral Voice',
}
