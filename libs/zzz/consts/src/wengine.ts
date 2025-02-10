import { objSumInPlace } from '@genshin-optimizer/common/util'
import type { CondKey } from './common'

export const allWengineRarityKeys = ['S', 'A'] as const
export type WengineRarityKey = (typeof allWengineRarityKeys)[number]

export const allWengineKeys = [
  'BashfulDemon',
  'BigCylinder',
  'BlazingLaurel',
  'BunnyBand',
  'CannonRotor',
  'DeepSeaVisitor',
  'DemaraBatteryMarkII',
  'DrillRigRedAxis',
  'ElectroLipGloss',
  'ElegantVanity',
  'FlamemakerShaker',
  'FusionCompiler',
  'GildedBlossom',
  'HailstormShrine',
  'HeartstringNocturne',
  'HellfireGears',
  'Housekeeper',
  'IceJadeTeapot',
  'IdentityBase',
  'IdentityInflection',
  'KaboomTheCannon',
  'LunarDecrescent',
  'LunarNoviluna',
  'LunarPleniluna',
  'MagneticStormAlpha',
  'MagneticStormBravo',
  'MagneticStormCharlie',
  'MarcatoDesire',
  'OriginalTransmorpher',
  'PeacekeeperSpecialized',
  'PreciousFossilizedCore',
  'RainforestGourmet',
  'ReverbMarkI',
  'ReverbMarkII',
  'ReverbMarkIII',
  'RiotSuppressorMarkVI',
  'RoaringRide',
  'SharpenedStinger',
  'SixShooter',
  'SliceOfTime',
  'SpringEmbrace',
  'StarlightEngine',
  'StarlightEngineReplica',
  'SteamOven',
  'SteelCushion',
  'StreetSuperstar',
  'TheBrimstone',
  'TheRestrained',
  'TheVault',
  'Timeweaver',
  'TusksOfFury',
  'UnfetteredGameBall',
  'VortexArrow',
  'VortexHatchet',
  'VortexRevolver',
  'WeepingCradle',
  'WeepingGemini',
  'ZanshinHerbCase',
] as const

export type WengineKey = (typeof allWengineKeys)[number]

export const allModificationKeys = [0, 1, 2, 3, 4, 5] as const
export type ModificationKey = (typeof allModificationKeys)[number]

export const allPhaseKeys = [1, 2, 3, 4, 5] as const
export type PhaseKey = (typeof allPhaseKeys)[number]
export const allWengineCondKeys = {
  BashfulDemon: {
    key: 'BashfulDemon',
    text: (val: number) => `${val}x Launching an EX Special Attack`,
    min: 1,
    max: 4,
  },
  BlazingLaurelImpact: {
    key: 'BlazingLaurelImpact',
    text: `Upon launching a Quick Assist or Perfect Assist`,
    min: 1,
    max: 1,
  },
  BlazingLaurelCritDmg: {
    key: 'BlazingLaurelCritDmg',
    text: (val: number) => `${val}x Wilt`,
    min: 1,
    max: 20,
  },
  BunnyBand: {
    key: 'BunnyBand',
    text: 'Shielded',
    min: 1,
    max: 1,
  },
  DeepSeaVisitorBasic: {
    key: 'DeepSeaVisitorBasic',
    text: 'hitting an enemy with a Basic Attack',
    min: 1,
    max: 1,
  },
  DeepSeaVisitorDash: {
    key: 'DeepSeaVisitorDash',
    text: 'hitting an enemy with a Dash Attack',
    min: 1,
    max: 1,
  },
  DrillRigRedAxis: {
    key: 'DrillRigRedAxis',
    text: 'When launching an EX Special Attack or Chain Attack',
    min: 1,
    max: 1,
  },
  ElectroLipGloss: {
    key: 'ElectroLipGloss',
    text: 'enemies inflicted with Attribute Anomaly',
    min: 1,
    max: 1,
  },
  ElegantVanity: {
    key: 'ElegantVanity',
    text: (val: number) =>
      `${val}x When the equipper consumes 25 or more Energy`,
    min: 1,
    max: 2,
  },
  FlamemakerShakerOffField: {
    key: 'FlamemakerShakerOffField',
    text: 'When off-field',
    min: 1,
    max: 1,
  },
  FlamemakerShakerStack: {
    key: 'FlamemakerShakerStack',
    text: (val: number) =>
      `${val}x Stacks of hitting an enemy with an EX Special Attack or Assist Attack`,
    min: 1,
    max: 10,
  },
  FusionCompiler: {
    key: 'FusionCompiler',
    text: (val: number) => `${val}x Special Attack or EX Special Attack`,
    min: 1,
    max: 3,
  },
  HailstormShrine: {
    key: 'HailstormShrine',
    text: (val: number) =>
      `${val}x Using an EX Special Attack or when any squad member applies an Attribute Anomaly to an enemy`,
    min: 1,
    max: 2,
  },
  HeartstringNocturne: {
    key: 'HeartstringNocturne',
    text: (val: number) => `${val}x Stacks of Heartstring`,
    min: 1,
    max: 2,
  },
  Housekeeper: {
    key: 'Housekeeper',
    text: (val: number) => `${val}x When an EX Special Attack hits an enemy`,
    min: 1,
    max: 15,
  },
  IceJadeTeapot: {
    key: 'IceJadeTeapot',
    text: (val: number) => `${val}x Tea-riffic`,
    min: 1,
    max: 30,
  },
  IdentityBase: {
    key: 'IdentityBase',
    text: 'When attacked',
    min: 1,
    max: 1,
  },
  KaboomTheCannon: {
    key: 'KaboomTheCannon',
    text: (val: number) =>
      `${val}x When any friendly unit in the squad attacks and hits an enemy`,
    min: 1,
    max: 4,
  },
  LunarDecrescent: {
    key: 'LunarDecrescent',
    text: 'Launching a Chain Attack or Ultimate',
    min: 1,
    max: 1,
  },
} as const
export type WengineCondKey = keyof typeof allWengineCondKeys
export const wengineSheets: Partial<
  Record<
    WengineKey,
    {
      condMeta:
        | (typeof allWengineCondKeys)[WengineCondKey]
        | Array<(typeof allWengineCondKeys)[WengineCondKey]>
      getStats: (
        conds: Partial<Record<CondKey, number>>,
        stats: Record<string, number>
      ) => Record<string, number> | undefined
    }
  >
> = {
  //Increases Ice DMG by 15%. When launching an EX Special Attack, all squad members' ATK increases by 2% for 12s, stacking up to 4 times. Repeated triggers reset the duration. Passive effects of the same name do not stack.
  BashfulDemon: {
    condMeta: allWengineCondKeys.BashfulDemon,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const ice_ = [0.15, 0.175, 0.2, 0.22, 0.24]
      const atk_ = [0.02, 0.023, 0.026, 0.029, 0.032]
      const ret: Record<string, number> = {
        ice_dmg_: ice_[ref],
      }
      if (conds['BashfulDemon'])
        objSumInPlace(ret, { cond_atk_: atk_[ref] * conds['BashfulDemon'] })
      return ret
    },
  },
  BlazingLaurel: {
    condMeta: [
      allWengineCondKeys.BlazingLaurelImpact,
      allWengineCondKeys.BlazingLaurelCritDmg,
    ],
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const imp = [0.25, 0.2875, 0.325, 0.3625, 0.4]
      const dmg_ = [0.015, 0.0172, 0.0195, 0.0217, 0.024]
      const ret: Record<string, number> = {}
      if (conds['BlazingLaurelImpact'])
        objSumInPlace(ret, { impact_: imp[ref] })
      if (conds['BlazingLaurelCritDmg'])
        objSumInPlace(ret, {
          crit_dmg_: dmg_[ref] * conds['BlazingLaurelCritDmg'],
        }) // TODO: Icon/Fire Crit DMG
      return ret
    },
  },
  BunnyBand: {
    condMeta: allWengineCondKeys.BunnyBand,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const hp_ = [0.08, 0.092, 0.104, 0.116, 0.128]
      const atk_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const ret: Record<string, number> = {
        hp_: hp_[ref],
      }
      if (conds['BunnyBand']) objSumInPlace(ret, { cond_atk_: atk_[ref] })
      return ret
    },
  },
  CannonRotor: {
    condMeta: [],
    getStats: (_, stats) => {
      const ref = stats['wengineRefine'] - 1
      const atk_ = [0.075, 0.086, 0.097, 0.108, 0.12]
      const ret: Record<string, number> = {
        atk_: atk_[ref],
      }
      return ret
    },
  },
  DeepSeaVisitor: {
    condMeta: [
      allWengineCondKeys.DeepSeaVisitorBasic,
      allWengineCondKeys.DeepSeaVisitorDash,
    ],
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const ice_ = [0.25, 0.315, 0.38, 0.445, 0.5]
      const crit_ = [0.1, 0.125, 0.15, 0.175, 0.2]
      const ret: Record<string, number> = {
        ice_dmg_: ice_[ref],
      }
      if (conds['DeepSeaVisitorBasic'])
        objSumInPlace(ret, { crit_: crit_[ref] })
      if (conds['DeepSeaVisitorDash']) objSumInPlace(ret, { crit_: crit_[ref] })
      return ret
    },
  },
  DemaraBatteryMarkII: {
    condMeta: [],
    getStats: (_, stats) => {
      const ref = stats['wengineRefine'] - 1
      const ele_ = [0.15, 0.175, 0.2, 0.22, 0.24]
      const ret: Record<string, number> = {
        electric_dmg_: ele_[ref],
      }
      return ret
    },
  },
  DrillRigRedAxis: {
    condMeta: allWengineCondKeys.DrillRigRedAxis,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const ele_ = [0.5, 0.575, 0.65, 0.725, 0.8]
      const ret: Record<string, number> = {}
      if (conds['DrillRigRedAxis'])
        objSumInPlace(ret, { electric_dmg_: ele_[ref] })
      return ret
    },
  },
  ElectroLipGloss: {
    condMeta: allWengineCondKeys.ElectroLipGloss,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const atk_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const dmg_ = [0.15, 0.175, 0.2, 0.225, 0.25]
      const ret: Record<string, number> = {}
      if (conds['ElectroLipGloss'])
        objSumInPlace(ret, { cond_atk_: atk_[ref], dmg_: dmg_[ref] })
      return ret
    },
  },
  ElegantVanity: {
    condMeta: allWengineCondKeys.ElegantVanity,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const dmg_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const ret: Record<string, number> = {}
      if (conds['ElegantVanity'])
        objSumInPlace(ret, { dmg_: dmg_[ref] * conds['ElegantVanity'] })
      return ret
    },
  },
  FlamemakerShaker: {
    condMeta: [
      allWengineCondKeys.FlamemakerShakerOffField,
      allWengineCondKeys.FlamemakerShakerStack,
    ],
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const dmg_ = [0.035, 0.044, 0.052, 0.061, 0.07]
      const anomProf = [50, 62, 75, 87, 100]
      if (conds['FlamemakerShakerStack']) {
        const ret: Record<string, number> = {
          dmg_: dmg_[ref] * conds['FlamemakerShakerStack'],
        }
        if (conds['FlamemakerShakerStack'] >= 5)
          objSumInPlace(ret, { anomProf: anomProf[ref] })
        return ret
      }
      return undefined
    },
  },
  FusionCompiler: {
    condMeta: allWengineCondKeys.FusionCompiler,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const atk_ = [0.12, 0.15, 0.18, 0.21, 0.24]
      const anomProf = [25, 31, 37, 43, 50]
      const ret: Record<string, number> = {
        atk_: atk_[ref],
      }
      if (conds['FusionCompiler'])
        objSumInPlace(ret, {
          anomProf: anomProf[ref] * conds['FusionCompiler'],
        })
      return ret
    },
  },
  GildedBlossom: {
    condMeta: [],
    getStats: (_, stats) => {
      const ref = stats['wengineRefine'] - 1
      const atk_ = [0.06, 0.069, 0.078, 0.087, 0.096]
      const dmg_ = [0.15, 0.172, 0.195, 0.218, 0.24] // TODO: DMG dealt by EX Special Attacks
      const ret: Record<string, number> = {
        atk_: atk_[ref],
        dmg_: dmg_[ref],
      }
      return ret
    },
  },
  HailstormShrine: {
    condMeta: allWengineCondKeys.HailstormShrine,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const crit_dmg_ = [0.5, 0.57, 0.65, 0.72, 0.8]
      const ice_dmg_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      const ret: Record<string, number> = {
        crit_dmg_: crit_dmg_[ref],
      }
      if (conds['HailstormShrine'])
        objSumInPlace(ret, {
          ice_dmg_: ice_dmg_[ref] * conds['HailstormShrine'],
        })
      return ret
    },
  },
  HeartstringNocturne: {
    condMeta: allWengineCondKeys.HeartstringNocturne,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const enemyResIgn_ = [0.125, 0.145, 0.165, 0.185, 0.2]
      const crit_dmg_ = [0.5, 0.575, 0.65, 0.725, 0.8]
      const ret: Record<string, number> = {
        crit_dmg_: crit_dmg_[ref],
      }
      if (conds['HeartstringNocturne'])
        objSumInPlace(ret, {
          enemyResIgn_: enemyResIgn_[ref] * conds['HeartstringNocturne'], // TODO: Chain Attack and Ultimate to ignore 20% of the target's Fire RES
        })
      return ret
    },
  },
  Housekeeper: {
    condMeta: allWengineCondKeys.Housekeeper,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const dmg_ = [0.03, 0.035, 0.04, 0.044, 0.048]
      const ret: Record<string, number> = {}
      if (conds['Housekeeper'])
        objSumInPlace(ret, {
          physical_dmg_: dmg_[ref] * conds['Housekeeper'],
        })
      return ret
    },
  },
  IceJadeTeapot: {
    condMeta: allWengineCondKeys.IceJadeTeapot,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const impact_ = [0.07, 0.088, 0.0105, 0.0122, 0.014]
      const dmg_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      const ret: Record<string, number> = {}
      if (conds['IceJadeTeapot'])
        objSumInPlace(ret, { impact_: impact_[ref] * conds['IceJadeTeapot'] })
      if ((conds['IceJadeTeapot'] ?? 0) >= 15)
        objSumInPlace(ret, { dmg_: dmg_[ref] })
      return ret
    },
  },
  IdentityBase: {
    condMeta: allWengineCondKeys.IdentityBase,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const def_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      if (conds['IdentityBase'])
        return {
          def_: def_[ref],
        } as Record<string, number>
      return undefined
    },
  },
  KaboomTheCannon: {
    condMeta: allWengineCondKeys.KaboomTheCannon,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const atk_ = [0.025, 0.028, 0.032, 0.036, 0.04]
      if (conds['KaboomTheCannon'])
        return {
          cond_atk_: atk_[ref] * conds['KaboomTheCannon'],
        } as Record<string, number>
      return undefined
    },
  },
  LunarDecrescent: {
    condMeta: allWengineCondKeys.LunarDecrescent,
    getStats: (conds, stats) => {
      const ref = stats['wengineRefine'] - 1
      const dmg_ = [0.15, 0.175, 0.2, 0.225, 0.25]
      if (conds['LunarDecrescent'])
        return {
          dmg_: dmg_[ref] * conds['LunarDecrescent'],
        } as Record<string, number>
      return undefined
    },
  },
  LunarPleniluna: {
    condMeta: [],
    getStats: (_, stats) => {
      const ref = stats['wengineRefine'] - 1
      const dmg_ = [0.12, 0.14, 0.16, 0.18, 0.2]
      return {
        dmg_: dmg_[ref], //TODO: Basic Attack, Dash Attack, and Dodge Counter DMG
      } as Record<string, number>
    },
  },
  // TODO: the rest of them painge
} as const
