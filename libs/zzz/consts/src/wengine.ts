import { objSumInPlace } from '@genshin-optimizer/common/util'
import type { CondKey, PandoStatKey } from './common'

export const allWengineRarityKeys = ['S', 'A', 'B'] as const
export type WengineRarityKey = (typeof allWengineRarityKeys)[number]

export const allWengineKeys = [
  'BashfulDemon',
  'BigCylinder',
  'BlazingLaurel',
  'BoxCutter',
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
  'SeveredInnocence',
  'SharpenedStinger',
  'SixShooter',
  'SliceOfTime',
  'SpectralGaze',
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

export function isWengineKey(key: unknown): key is WengineKey {
  return typeof key === 'string' && allWengineKeys.includes(key as WengineKey)
}

export const allWengineSubStatKeys = [
  'hp_',
  'atk_',
  'pen_',
  'def_',
  'crit_',
  'crit_dmg_',
  'anomProf',
  'impact_',
  'enerRegen_',
] as const
export type WengineSubStatKey = (typeof allWengineSubStatKeys)[number]

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
    text: 'Upon launching a Quick Assist or Perfect Assist',
    min: 1,
    max: 1,
  },
  BlazingLaurelCritDmg: {
    key: 'BlazingLaurelCritDmg',
    text: (val: number) => `${val}x Wilt`,
    min: 1,
    max: 20,
  },
  BoxCutter: {
    key: 'BoxCutter',
    text: 'Upon launching an Aftershock',
    min: 1,
    max: 1,
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
  MagneticStormAlpha: {
    key: 'MagneticStormAlpha',
    text: 'Accumulating Anomaly Buildup',
    min: 1,
    max: 1,
  },
  MagneticStormBravo: {
    key: 'MagneticStormBravo',
    text: 'Accumulating Anomaly Buildup',
    min: 1,
    max: 1,
  },
  MarcatoDesireHit: {
    key: 'MarcatoDesireHit',
    text: 'When an EX Special Attack or Chain Attack hits an enemy',
    min: 1,
    max: 1,
  },
  MarcatoDesireAnomaly: {
    key: 'MarcatoDesireAnomaly',
    text: 'While the target is under an Attribute Anomaly',
    min: 1,
    max: 1,
  },
  OriginalTransmorpher: {
    key: 'OriginalTransmorpher',
    text: 'When attacked',
    min: 1,
    max: 1,
  },
  RainforestGourmet: {
    key: 'RainforestGourmet',
    text: (val: number) => `${val}x Stacks`,
    min: 1,
    max: 10,
  },
  ReverbMarkII: {
    key: 'ReverbMarkII',
    text: 'Launching an EX Special Attack or Chain Attack',
    min: 1,
    max: 1,
  },
  ReverbMarkIII: {
    key: 'ReverbMarkIII',
    text: 'Launching a Chain Attack or Ultimate',
    min: 1,
    max: 1,
  },
  RiotSuppressorMarkVI: {
    key: 'RiotSuppressorMarkVI',
    text: 'consumes a Charge stack',
    min: 1,
    max: 1,
  },
  RoaringRideATK: {
    key: 'RoaringRideATK',
    text: "Increases the equipper's ATK",
    min: 1,
    max: 1,
  },
  RoaringRideAnomProf: {
    key: 'RoaringRideAnomProf',
    text: "increases the equipper's Anomaly Proficiency",
    min: 1,
    max: 1,
  },
  RoaringRideAnomBuild_: {
    key: 'RoaringRideAnomBuild_',
    text: "increases the equipper's Anomaly Buildup Rate",
    min: 1,
    max: 1,
  },
  SeveredInnocence: {
    key: 'SeveredInnocence',
    text: (val: number) => `${val} Stacks`,
    min: 1,
    max: 3,
  },
  SharpenedStinger: {
    key: 'SharpenedStinger',
    text: (val: number) => `${val}x Predatory Instinct`,
    min: 1,
    max: 3,
  },
  // SpectralGazeElecAfter: {
  //   key: 'SpectralGazeElecAfter',
  //   text: 'Equipper hits an enemy with an Aftershock, causing Electric DMG',
  //   min: 1,
  //   max: 1,
  // },
  SpectralGazeSpiritLock: {
    key: 'SpectralGazeSpiritLock',
    text: (val: number) => `${val} Spirit Lock stacks`,
    min: 1,
    max: 3,
  },
  StarlightEngine: {
    key: 'StarlightEngine',
    text: 'Launching a Dodge Counter or Quick Assist',
    min: 1,
    max: 1,
  },
  StarlightEngineReplica: {
    key: 'StarlightEngineReplica',
    text: 'hitting an enemy at least 6 meters away with a Basic Attack or Dash Attack',
    min: 1,
    max: 1,
  },
  SteamOven: {
    key: 'SteamOven',
    text: (val: number) => `${val * 10} Energy accumulated`,
    min: 1,
    max: 8,
  },
  SteelCushion: {
    key: 'SteelCushion',
    text: 'when hitting the enemy from behind',
    min: 1,
    max: 1,
  },
  StreetSuperstar: {
    key: 'StreetSuperstar',
    text: (val: number) => `${val} Charge stacks`,
    min: 1,
    max: 3,
  },
  TheBrimstone: {
    key: 'TheBrimstone',
    text: (val: number) =>
      `${val}x Upon hitting an enemy with a Basic Attack, Dash Attack, or Dodge Counter`,
    min: 1,
    max: 8,
  },
  TheRestrained: {
    key: 'TheRestrained',
    text: (val: number) =>
      `${val}x When an attack hits an enemy, DMG and Daze from Basic Attacks`,
    min: 1,
    max: 5,
  },
  TheVault: {
    key: 'TheVault',
    text: 'Dealing Ether DMG using an EX Special Attack, Chain Attack, or Ultimate',
    min: 1,
    max: 1,
  },
  Timeweaver: {
    key: 'Timeweaver',
    text: 'When Special Attacks or EX Special Attacks hit enemies suffering an Attribute Anomaly',
    min: 1,
    max: 1,
  },
  TusksOfFury: {
    key: 'TusksOfFury',
    text: 'When any squad member triggers Interrupt or Perfect Dodge',
    min: 1,
    max: 1,
  },
  UnfetteredGameBall: {
    key: 'UnfetteredGameBall',
    text: "Whenever the equipper's attack triggers an Attribute Counter effect",
    min: 1,
    max: 1,
  },
  WeepingCradle: {
    key: 'WeepingCradle',
    text: (val: number) => `${val}x Attacks from the equipper`,
    min: 1,
    max: 6,
  },
  WeepingGemini: {
    key: 'WeepingGemini',
    text: (val: number) =>
      `${val}x Whenever a squad member inflicts an Attribute Anomaly on an enemy`,
    min: 1,
    max: 4,
  },
  ZanshinHerbCase: {
    key: 'ZanshinHerbCase',
    text: 'When any squad member applies an Attribute Anomaly or Stuns an enemy',
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
      const p = stats.wenginePhase - 1
      const ice_ = [0.15, 0.175, 0.2, 0.22, 0.24]
      const atk_ = [0.02, 0.023, 0.026, 0.029, 0.032]
      const ret: Record<string, number> = {
        ice_dmg_: ice_[p],
      }
      if (conds.BashfulDemon)
        objSumInPlace(ret, { cond_atk_: atk_[p] * conds.BashfulDemon })
      return ret
    },
  },
  BlazingLaurel: {
    condMeta: [
      allWengineCondKeys.BlazingLaurelImpact,
      allWengineCondKeys.BlazingLaurelCritDmg,
    ],
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const imp = [0.25, 0.2875, 0.325, 0.3625, 0.4]
      const dmg_ = [0.015, 0.0172, 0.0195, 0.0217, 0.024]
      const ret: Record<string, number> = {}
      if (conds.BlazingLaurelImpact) objSumInPlace(ret, { impact_: imp[p] })
      if (conds.BlazingLaurelCritDmg)
        objSumInPlace(ret, {
          crit_dmg_: dmg_[p] * conds.BlazingLaurelCritDmg,
        }) // TODO: Icon/Fire Crit DMG
      return ret
    },
  },
  BoxCutter: {
    condMeta: allWengineCondKeys.BoxCutter,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const phys_dmg_ = [0.15, 0.173, 0.195, 0.218, 0.24]
      const daze_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      if (conds.BoxCutter)
        return { physical_dmg_: phys_dmg_[p], daze_: daze_[p] }
      return undefined
    },
  },
  BunnyBand: {
    condMeta: allWengineCondKeys.BunnyBand,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const hp_ = [0.08, 0.092, 0.104, 0.116, 0.128]
      const atk_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const ret: Record<string, number> = {
        cond_hp_: hp_[p],
      }
      if (conds.BunnyBand) objSumInPlace(ret, { cond_atk_: atk_[p] })
      return ret
    },
  },
  CannonRotor: {
    condMeta: [],
    getStats: (_, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.075, 0.086, 0.097, 0.108, 0.12]
      const ret: Record<string, number> = {
        cond_atk_: atk_[p],
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
      const p = stats.wenginePhase - 1
      const ice_ = [0.25, 0.315, 0.38, 0.445, 0.5]
      const crit_ = [0.1, 0.125, 0.15, 0.175, 0.2]
      const ret: Record<string, number> = {
        ice_dmg_: ice_[p],
      }
      if (conds.DeepSeaVisitorBasic) objSumInPlace(ret, { crit_: crit_[p] })
      if (conds.DeepSeaVisitorDash) objSumInPlace(ret, { crit_: crit_[p] })
      return ret
    },
  },
  DemaraBatteryMarkII: {
    condMeta: [],
    getStats: (_, stats) => {
      const p = stats.wenginePhase - 1
      const ele_ = [0.15, 0.175, 0.2, 0.22, 0.24]
      const ret: Record<string, number> = {
        electric_dmg_: ele_[p],
      }
      return ret
    },
  },
  DrillRigRedAxis: {
    condMeta: allWengineCondKeys.DrillRigRedAxis,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const ele_ = [0.5, 0.575, 0.65, 0.725, 0.8]
      const ret: Record<string, number> = {}
      if (conds.DrillRigRedAxis) objSumInPlace(ret, { electric_dmg_: ele_[p] })
      return ret
    },
  },
  ElectroLipGloss: {
    condMeta: allWengineCondKeys.ElectroLipGloss,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const dmg_ = [0.15, 0.175, 0.2, 0.225, 0.25]
      const ret: Record<string, number> = {}
      if (conds.ElectroLipGloss)
        objSumInPlace(ret, { cond_atk_: atk_[p], dmg_: dmg_[p] })
      return ret
    },
  },
  ElegantVanity: {
    condMeta: allWengineCondKeys.ElegantVanity,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const ret: Record<string, number> = {}
      if (conds.ElegantVanity)
        objSumInPlace(ret, { dmg_: dmg_[p] * conds.ElegantVanity })
      return ret
    },
  },
  FlamemakerShaker: {
    condMeta: [
      allWengineCondKeys.FlamemakerShakerOffField,
      allWengineCondKeys.FlamemakerShakerStack,
    ],
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.035, 0.044, 0.052, 0.061, 0.07]
      const anomProf = [50, 62, 75, 87, 100]
      if (conds.FlamemakerShakerStack) {
        const ret: Record<string, number> = {
          dmg_: dmg_[p] * conds.FlamemakerShakerStack,
        }
        if (conds.FlamemakerShakerStack >= 5)
          objSumInPlace(ret, { cond_anomProf: anomProf[p] })
        return ret
      }
      return undefined
    },
  },
  FusionCompiler: {
    condMeta: allWengineCondKeys.FusionCompiler,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.12, 0.15, 0.18, 0.21, 0.24]
      const anomProf = [25, 31, 37, 43, 50]
      const ret: Record<string, number> = {
        cond_atk_: atk_[p],
      }
      if (conds.FusionCompiler)
        objSumInPlace(ret, {
          cond_anomProf: anomProf[p] * conds.FusionCompiler,
        })
      return ret
    },
  },
  GildedBlossom: {
    condMeta: [],
    getStats: (_, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.06, 0.069, 0.078, 0.087, 0.096]
      const dmg_ = [0.15, 0.172, 0.195, 0.218, 0.24] // TODO: DMG dealt by EX Special Attacks
      const ret: Record<string, number> = {
        cond_atk_: atk_[p],
        dmg_: dmg_[p],
      }
      return ret
    },
  },
  HailstormShrine: {
    condMeta: allWengineCondKeys.HailstormShrine,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const crit_dmg_ = [0.5, 0.57, 0.65, 0.72, 0.8]
      const ice_dmg_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      const ret: Record<string, number> = {
        crit_dmg_: crit_dmg_[p],
      }
      if (conds.HailstormShrine)
        objSumInPlace(ret, {
          ice_dmg_: ice_dmg_[p] * conds.HailstormShrine,
        })
      return ret
    },
  },
  HeartstringNocturne: {
    condMeta: allWengineCondKeys.HeartstringNocturne,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const enemyResIgn_ = [0.125, 0.145, 0.165, 0.185, 0.2]
      const crit_dmg_ = [0.5, 0.575, 0.65, 0.725, 0.8]
      const ret: Record<string, number> = {
        crit_dmg_: crit_dmg_[p],
      }
      if (conds.HeartstringNocturne)
        objSumInPlace(ret, {
          enemyResIgn_: enemyResIgn_[p] * conds.HeartstringNocturne, // TODO: Chain Attack and Ultimate to ignore 20% of the target's Fire RES
        })
      return ret
    },
  },
  Housekeeper: {
    condMeta: allWengineCondKeys.Housekeeper,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.03, 0.035, 0.04, 0.044, 0.048]
      const ret: Record<string, number> = {}
      if (conds.Housekeeper)
        objSumInPlace(ret, {
          physical_dmg_: dmg_[p] * conds.Housekeeper,
        })
      return ret
    },
  },
  IceJadeTeapot: {
    condMeta: allWengineCondKeys.IceJadeTeapot,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const impact_ = [0.07, 0.088, 0.0105, 0.0122, 0.014]
      const dmg_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      const ret: Record<string, number> = {}
      if (conds.IceJadeTeapot)
        objSumInPlace(ret, { impact_: impact_[p] * conds.IceJadeTeapot })
      if ((conds.IceJadeTeapot ?? 0) >= 15)
        objSumInPlace(ret, { dmg_: dmg_[p] })
      return ret
    },
  },
  IdentityBase: {
    condMeta: allWengineCondKeys.IdentityBase,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const def_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      if (conds.IdentityBase)
        return {
          cond_def_: def_[p],
        } as Record<string, number>
      return undefined
    },
  },
  KaboomTheCannon: {
    condMeta: allWengineCondKeys.KaboomTheCannon,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.025, 0.028, 0.032, 0.036, 0.04]
      if (conds.KaboomTheCannon)
        return {
          cond_atk_: atk_[p] * conds.KaboomTheCannon,
        } as Record<string, number>
      return undefined
    },
  },
  LunarDecrescent: {
    condMeta: allWengineCondKeys.LunarDecrescent,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.15, 0.175, 0.2, 0.225, 0.25]
      if (conds.LunarDecrescent)
        return {
          dmg_: dmg_[p] * conds.LunarDecrescent,
        } as Record<string, number>
      return undefined
    },
  },
  LunarPleniluna: {
    condMeta: [],
    getStats: (_, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.12, 0.14, 0.16, 0.18, 0.2]
      return {
        dmg_: dmg_[p], //TODO: Basic Attack, Dash Attack, and Dodge Counter DMG
      } as Record<string, number>
    },
  },
  MagneticStormAlpha: {
    condMeta: allWengineCondKeys.MagneticStormAlpha,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const anomMas = [25, 28, 32, 36, 40]
      if (conds.MagneticStormAlpha)
        return {
          cond_anomMas: anomMas[p],
        } as Record<string, number>
      return undefined
    },
  },
  MagneticStormBravo: {
    condMeta: allWengineCondKeys.MagneticStormBravo,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const anomProf = [25, 28, 32, 36, 40]
      if (conds.MagneticStormBravo)
        return {
          anomProf: anomProf[p],
        } as Record<string, number>
      return undefined
    },
  },
  MarcatoDesire: {
    condMeta: [
      allWengineCondKeys.MarcatoDesireHit,
      allWengineCondKeys.MarcatoDesireAnomaly,
    ],
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.06, 0.07, 0.08, 0.09, 0.1]
      if (conds.MarcatoDesireHit || conds.MarcatoDesireAnomaly)
        return {
          cond_atk_:
            atk_[p] *
            ((conds.MarcatoDesireHit ?? 0) + (conds.MarcatoDesireAnomaly ?? 0)),
        } as Record<string, number>
      return undefined
    },
  },
  OriginalTransmorpher: {
    condMeta: allWengineCondKeys.OriginalTransmorpher,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const hp_ = [0.08, 0.09, 0.1, 0.11, 0.125]
      const impact_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const ret: Record<string, number> = {
        cond_hp_: hp_[p],
      }
      if (conds.OriginalTransmorpher)
        objSumInPlace(ret, { impact_: impact_[p] })
      return ret
    },
  },
  RainforestGourmet: {
    condMeta: allWengineCondKeys.RainforestGourmet,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.025, 0.028, 0.032, 0.036, 0.04]
      if (conds.RainforestGourmet)
        return {
          cond_atk_: atk_[p] * conds.RainforestGourmet,
        } as Record<string, number>
      return undefined
    },
  },
  ReverbMarkII: {
    condMeta: allWengineCondKeys.ReverbMarkII,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const anom = [10, 12, 13, 15, 16]
      if (conds.ReverbMarkII)
        return {
          cond_anomMas: anom[p],
          anomProf: anom[p],
        } as Record<string, number>
      return undefined
    },
  },
  ReverbMarkIII: {
    condMeta: allWengineCondKeys.ReverbMarkIII,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.08, 0.09, 0.1, 0.11, 0.12]
      if (conds.ReverbMarkIII)
        return {
          cond_atk_: atk_[p],
        } as Record<string, number>
      return undefined
    },
  },
  RiotSuppressorMarkVI: {
    condMeta: allWengineCondKeys.RiotSuppressorMarkVI,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const crit_ = [0.15, 0.188, 0.226, 0.264, 0.3]
      const dmg_ = [0.35, 0.435, 0.52, 0.605, 0.7]
      const ret = {
        crit_: crit_[p],
      } as Record<string, number>
      if (conds.RiotSuppressorMarkVI) objSumInPlace(ret, { dmg_: dmg_[p] }) // TODO: increases the skill's DMG by 60.5%
      return ret
    },
  },
  RoaringRide: {
    condMeta: [
      allWengineCondKeys.RoaringRideATK,
      allWengineCondKeys.RoaringRideAnomProf,
      allWengineCondKeys.RoaringRideAnomBuild_,
    ],
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.08, 0.092, 0.104, 0.116, 0.128]
      const anomProf = [40, 46, 52, 58, 64]
      const anomBuild_ = [0.25, 0.28, 0.32, 0.36, 0.4]
      const ret: Record<string, number> = {}
      if (conds.RoaringRideATK)
        objSumInPlace(ret, {
          cond_atk_: atk_[p],
        })
      if (conds.RoaringRideAnomProf)
        objSumInPlace(ret, {
          cond_anomProf: anomProf[p],
        })
      if (conds.RoaringRideAnomBuild_)
        objSumInPlace(ret, {
          anomBuild_: anomBuild_[p],
        })
      return ret
    },
  },
  SeveredInnocence: {
    condMeta: allWengineCondKeys.SeveredInnocence,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const crit_dmg_ = [0.3, 0.345, 0.39, 0.435, 0.48]
      const addl_crit_dmg_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const electric_dmg_ = [0.2, 0.23, 0.26, 0.29, 0.32]
      const buffs: Partial<Record<PandoStatKey, number>> = {
        crit_dmg_: crit_dmg_[p],
      }
      if (conds.SeveredInnocence) {
        buffs.crit_dmg_! += addl_crit_dmg_[p] * conds.SeveredInnocence
        if (conds.SeveredInnocence === 3) {
          buffs.electric_dmg_ = electric_dmg_[p]
        }
      }
      return buffs
    },
  },
  SharpenedStinger: {
    condMeta: allWengineCondKeys.SharpenedStinger,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const physical_dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
      const anomBuild_ = [0.4, 0.5, 0.6, 0.7, 0.8]
      if (conds.SharpenedStinger) {
        if (conds.SharpenedStinger < 3)
          return {
            physical_dmg_: physical_dmg_[p] * conds.SharpenedStinger,
          } as Record<string, number>
        return {
          physical_dmg_: physical_dmg_[p] * conds.SharpenedStinger,
          anomBuild_: anomBuild_[p],
        } as Record<string, number>
      }
      return undefined
    },
  },
  SpectralGaze: {
    // condMeta:[ allWengineCondKeys.SpectralGazeElecAfter, allWengineCondKeys.SpectralGazeSpritLock],
    condMeta: allWengineCondKeys.SpectralGazeSpiritLock,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      // const def_red_ = [0.25, 0.2875, 0.325, 0.3625, 0.4]
      const impact_ = [0.04, 0.046, 0.052, 0.058, 0.064]
      const full_impact_ = [0.08, 0.092, 0.104, 0.116, 0.128]
      const buffs: Partial<Record<PandoStatKey, number>> = {}
      // if (conds.SpectralGazeElecAfter) buffs.def_red_ = def_red_[p]
      if (conds.SpectralGazeSpiritLock) {
        buffs.impact_ = impact_[p] * conds.SpectralGazeSpiritLock
        if (conds.SpectralGazeSpiritLock === 3) buffs.impact_ += full_impact_[p]
      }
      return buffs
    },
  },
  StarlightEngine: {
    condMeta: allWengineCondKeys.StarlightEngine,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.12, 0.138, 0.156, 0.174, 0.192]
      if (conds.StarlightEngine)
        return {
          cond_atk_: atk_[p],
        } as Record<string, number>
      return undefined
    },
  },
  StarlightEngineReplica: {
    condMeta: allWengineCondKeys.StarlightEngineReplica,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const physical_dmg_ = [0.36, 0.41, 0.465, 0.52, 0.575]
      if (conds.StarlightEngineReplica)
        return {
          physical_dmg_: physical_dmg_[p],
        } as Record<string, number>
      return undefined
    },
  },
  SteamOven: {
    condMeta: allWengineCondKeys.SteamOven,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const impact_ = [0.02, 0.023, 0.026, 0.029, 0.032]
      if (conds.SteamOven)
        return {
          impact_: impact_[p] * conds.SteamOven,
        } as Record<string, number>
      return undefined
    },
  },
  SteelCushion: {
    condMeta: allWengineCondKeys.SteelCushion,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const physical_dmg_ = [0.2, 0.25, 0.3, 0.35, 0.4]
      const dmg_ = [0.25, 0.315, 0.38, 0.44, 0.5]
      const ret = {
        physical_dmg_: physical_dmg_[p],
      } as Record<string, number>
      if (conds.SteelCushion) {
        objSumInPlace(ret, {
          dmg_: dmg_[p],
        })
      }
      return ret
    },
  },
  StreetSuperstar: {
    condMeta: allWengineCondKeys.StreetSuperstar,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.15, 0.172, 0.195, 0.217, 0.24]
      if (conds.StreetSuperstar)
        return {
          dmg_: dmg_[p], // TODO: increases the skill's DMG by 24%.
        } as Record<string, number>
      return undefined
    },
  },
  TheBrimstone: {
    condMeta: allWengineCondKeys.TheBrimstone,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const atk_ = [0.035, 0.044, 0.052, 0.06, 0.07]
      if (conds.TheBrimstone)
        return {
          cond_atk_: atk_[p] * conds.TheBrimstone,
        } as Record<string, number>
      return undefined
    },
  },
  TheRestrained: {
    condMeta: allWengineCondKeys.TheRestrained,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.06, 0.075, 0.09, 0.105, 0.12]
      if (conds.TheRestrained)
        return {
          // TODO: DMG and Daze from Basic Attacks
          dmg_: dmg_[p] * conds.TheRestrained,
          daze_: dmg_[p] * conds.TheRestrained,
        } as Record<string, number>
      return undefined
    },
  },
  TheVault: {
    condMeta: allWengineCondKeys.TheVault,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_ = [0.15, 0.175, 0.2, 0.22, 0.24]
      if (conds.TheVault)
        return {
          dmg_: dmg_[p],
        } as Record<string, number>
      return undefined
    },
  },
  Timeweaver: {
    condMeta: allWengineCondKeys.Timeweaver,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      // TODO: const electric_anomBuildup = [0.3,0.35,0.4,0.45,0.5]
      const anomProf = [75, 85, 95, 105, 115]
      const dmg_ = [0.25, 0.275, 0.3, 0.325, 0.35]
      const ret = {
        // TODO: electric_anomBuildup
      } as Record<string, number>
      if (conds.Timeweaver)
        objSumInPlace(ret, {
          cond_anomProf: anomProf[p],
        })
      if ((stats.anomProf ?? 0) >= 375)
        objSumInPlace(ret, {
          dmg_: dmg_[p],
        })
      return ret
    },
  },
  TusksOfFury: {
    condMeta: allWengineCondKeys.TusksOfFury,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const shield_ = [0.3, 0.38, 0.46, 0.52, 0.6]
      const dmg_ = [0.18, 0.225, 0.27, 0.315, 0.36]
      const daze_ = [0.12, 0.15, 0.18, 0.21, 0.24]
      const ret = {
        shield_: shield_[p],
      } as Record<string, number>
      if (conds.TusksOfFury)
        objSumInPlace(ret, {
          dmg_: dmg_[p],
          daze_: daze_[p],
        })
      return ret
    },
  },
  UnfetteredGameBall: {
    condMeta: allWengineCondKeys.UnfetteredGameBall,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const crit_ = [0.12, 0.135, 0.155, 0.175, 0.2]
      if (conds.UnfetteredGameBall)
        return {
          crit_: crit_[p],
        } as Record<string, number>
      return undefined
    },
  },
  WeepingCradle: {
    condMeta: allWengineCondKeys.WeepingCradle,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const dmg_static = [0.1, 0.125, 0.15, 0.175, 0.2]
      const dmg_ = [0.017, 0.02, 0.025, 0.03, 0.033]
      if (conds.WeepingCradle)
        return {
          dmg_: dmg_static[p] + dmg_[p] * conds.WeepingCradle,
        } as Record<string, number>
      return undefined
    },
  },
  WeepingGemini: {
    condMeta: allWengineCondKeys.WeepingGemini,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const anomProf = [30, 34, 38, 42, 48]
      if (conds.WeepingGemini)
        return {
          cond_anomProf: anomProf[p] * conds.WeepingGemini,
        } as Record<string, number>
      return undefined
    },
  },
  ZanshinHerbCase: {
    condMeta: allWengineCondKeys.ZanshinHerbCase,
    getStats: (conds, stats) => {
      const p = stats.wenginePhase - 1
      const crit_ = [0.1, 0.115, 0.13, 0.145, 0.16]
      const electric_dmg_ = [0.4, 0.46, 0.58, 0.174, 0.64]
      const ret = {
        crit_: crit_[p],
        electric_dmg_: electric_dmg_[p], // TODO: Dash Attack Electric DMG increases by 40%
      } as Record<string, number>
      if (conds.ZanshinHerbCase)
        objSumInPlace(ret, {
          crit_: crit_[p],
        })
      return ret
    },
  },
} as const

export const wengineMaxLevel = 60
