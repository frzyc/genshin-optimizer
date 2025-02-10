import {
  objMultiplication,
  objSumInPlace,
} from '@genshin-optimizer/common/util'
import type { PandoStatKey } from './common'

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
  Partial<Record<PandoStatKey, number>>
> = {
  AstralVoice: { atk_: 0.1 },
  BranchBladeSong: { crit_dmg_: 0.16 },
  ChaosJazz: { anomProf: 30 },
  ChaoticMetal: { ether_dmg_: 0.1 },
  FangedMetal: { physical_dmg_: 0.1 },
  FreedomBlues: { anomProf: 30 },
  HormonePunk: { atk_: 0.1 },
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

// Copied from libs\zzz\dm\src\dm\disc\discNames.json, mainly used for scanner.
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

export const discRarityColor = {
  S: 'warning',
  A: 'roll6',
  B: 'roll5',
} as const

export const allDiscCondKeys = {
  AstralVoice: {
    key: 'AstralVoice',
    text: (val: number) => `${val} Stacks of Astral`,
    min: 1,
    max: 3,
  },
  BranchBladeSong: {
    key: 'BranchBladeSong',
    text: `When any squad member applies Freeze or triggers the Shatter effect on an enemy`,
    min: 1,
    max: 1,
  },
  ChaosJazz: {
    key: 'ChaosJazz',
    text: 'When off-field',
    min: 1,
    max: 1,
  },
  ChaoticMetal: {
    key: 'ChaoticMetal',
    text: (val: number) => `${val}x Corruption Triggers`,
    min: 1,
    max: 6,
  },
  FangedMetal: {
    key: 'FangedMetal',
    text: 'Whenever a squad member inflicts Assault on an enemy',
    min: 1,
    max: 1,
  },
  HormonePunk: {
    key: 'HormonePunk',
    text: 'Upon entering or switching into combat',
    min: 1,
    max: 1,
  },
  InfernoMetal: {
    key: 'InfernoMetal',
    text: 'Upon hitting a Burning enemy',
    min: 1,
    max: 1,
  },
  PolarMetal: {
    key: 'PolarMetal',
    text: 'Whenever a squad member Freezes or Shatters an enemy',
    min: 1,
    max: 1,
  },
  ProtoPunk: {
    key: 'ProtoPunk',
    text: 'When any squad member triggers a Defensive Assist or Evasive Assist',
    min: 1,
    max: 1,
  },
  PufferElectro: {
    key: 'PufferElectro',
    text: 'Launching an Ultimate',
    min: 1,
    max: 1,
  },
  SwingJazz: {
    key: 'SwingJazz',
    text: 'Launching a Chain Attack or Ultimate',
    min: 1,
    max: 1,
  },
  ThunderMetal: {
    key: 'ThunderMetal',
    text: 'As long as an enemy in combat is Shocked',
    min: 1,
    max: 1,
  },
  WoodpeckerElectro: {
    key: 'WoodpeckerElectro',
    text: (val: number) =>
      `${val}x Triggering a critical hit with a Basic Attack, Dodge Counter, or EX Special Attack`,
    min: 1,
    max: 3,
  },
} as const

export type DiscCondKey = keyof typeof allDiscCondKeys
export const disc4PeffectSheets: Partial<
  Record<
    DiscSetKey,
    {
      condMeta:
        | (typeof allDiscCondKeys)[DiscCondKey]
        | Array<(typeof allDiscCondKeys)[DiscCondKey]>
      getStats: (
        conds: Partial<Record<DiscCondKey, number>>,
        stats: Record<string, number>
      ) => Record<string, number> | undefined
    }
  >
> = {
  AstralVoice: {
    condMeta: allDiscCondKeys.AstralVoice,
    getStats: (conds) => {
      return conds['AstralVoice']
        ? (objMultiplication({ dmg_: 0.08 }, conds['AstralVoice']) as Record<
            string,
            number
          >)
        : undefined
    },
  },
  BranchBladeSong: {
    condMeta: allDiscCondKeys.BranchBladeSong,
    getStats: (conds, stats) => {
      const ret: Record<string, number> = {}
      if (stats['anomMas'] >= 115) ret['crit_dmg_'] = 0.3
      if (conds['BranchBladeSong']) ret['crit_'] = 0.12
      return ret
    },
  },
  ChaosJazz: {
    condMeta: allDiscCondKeys.ChaosJazz,
    getStats: (conds) => {
      const ret: Record<string, number> = {
        fire_dmg_: 0.15,
        electric_dmg_: 0.15,
      }
      if (conds['ChaosJazz']) ret['dmg_'] = 0.2 // TODO: Should be EX Special Attacks and Assist Attacks
      return ret
    },
  },
  ChaoticMetal: {
    condMeta: allDiscCondKeys.ChaoticMetal,
    getStats: (conds) => {
      const ret: Record<string, number> = {
        crit_dmg_: 0.2,
      }
      if (conds['ChaoticMetal'])
        objSumInPlace(
          ret,
          objMultiplication(
            { crit_dmg_: 0.055 },
            conds['ChaoticMetal']
          ) as Record<string, number>
        )
      return ret
    },
  },
  FangedMetal: {
    condMeta: allDiscCondKeys.FangedMetal,
    getStats: (conds) => {
      if (conds['FangedMetal']) return { dmg_: 0.35 } // equipper deals 35% additional DMG
      return undefined
    },
  },
  // FreedomBlues: reduce the target's Anomaly Buildup RES to the equipper's Attribute by 35%
  HormonePunk: {
    condMeta: allDiscCondKeys.HormonePunk,
    getStats: (conds) => {
      if (conds['HormonePunk']) return { cond_atk_: 0.25 } // ATK increased by 25%
      return undefined
    },
  },
  InfernoMetal: {
    condMeta: allDiscCondKeys.InfernoMetal,
    getStats: (conds) => {
      if (conds['InfernoMetal']) return { crit_: 0.28 } //equipper's CRIT Rate is increased by 28%
      return undefined
    },
  },
  PolarMetal: {
    condMeta: allDiscCondKeys.PolarMetal,
    getStats: (conds) => {
      const ret = { dmg_: 0.2 } // TODO: Increase the DMG of Basic Attack and Dash Attack by 20%
      if (conds['PolarMetal']) {
        objMultiplication(ret, 2)
      }
      return ret
    },
  },
  ProtoPunk: {
    condMeta: allDiscCondKeys.ProtoPunk,
    getStats: (conds) => {
      if (conds['ProtoPunk']) return { dmg_: 0.15 } //  all squad members deal 15% increased DMG
      return undefined
    },
  },
  PufferElectro: {
    condMeta: allDiscCondKeys.PufferElectro,
    getStats: (conds) => {
      const ret: Record<string, number> = { dmg_: 0.2 } //Ultimate DMG increases by 20%
      if (conds['PufferElectro']) ret['cond_atk_'] = 0.15 // Launching an Ultimate increases the equipper's ATK by 15%
      return ret
    },
  },
  // ShockstarDisco: 15% more Daze
  // SoulRock: the equipper takes 40% less DMG
  SwingJazz: {
    condMeta: allDiscCondKeys.SwingJazz,
    getStats: (conds) => {
      if (conds['SwingJazz']) return { dmg_: 0.15 } //increases all squad members' DMG by 15%
      return undefined
    },
  },
  ThunderMetal: {
    condMeta: allDiscCondKeys.ThunderMetal,
    getStats: (conds) => {
      if (conds['ThunderMetal']) return { cond_atk_: 0.27 } // equipper's ATK is increased by 27%
      return undefined
    },
  },
  WoodpeckerElectro: {
    condMeta: allDiscCondKeys.WoodpeckerElectro,
    getStats: (conds) => {
      if (conds['WoodpeckerElectro'])
        return objMultiplication(
          { cond_atk_: 0.09 },
          conds['WoodpeckerElectro']
        ) as Record<string, number>
      return undefined
    },
  },
} as const
