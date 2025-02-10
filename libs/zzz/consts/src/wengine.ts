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
