export const allWengineRarityKeys = ['S', 'A', 'B'] as const
export type WengineRarityKey = (typeof allWengineRarityKeys)[number]

export const allWengineKeys = [
  'BashfulDemon',
  'BellicoseBlaze',
  'BigCylinder',
  'BlazingLaurel',
  'BoxCutter',
  'BunnyBand',
  'CannonRotor',
  'CinderCobalt',
  'CordisGermina',
  'DeepSeaVisitor',
  'DemaraBatteryMarkII',
  'DrillRigRedAxis',
  'ElectroLipGloss',
  'ElegantVanity',
  'FlamemakerShaker',
  'FlightOfFancy',
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
  'Metanukimorphosis',
  'MyriadEclipse',
  'OriginalTransmorpher',
  'PeacekeeperSpecialized',
  'PracticedPerfection',
  'PreciousFossilizedCore',
  'PuzzleSphere',
  'QingmingBirdcage',
  'RadiowaveJourney',
  'RainforestGourmet',
  'ReelProjector',
  'ReverbMarkI',
  'ReverbMarkII',
  'ReverbMarkIII',
  'RiotSuppressorMarkVI',
  'RoaringFurnace',
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
  'TremorTrigramVessel',
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

export const wengineMaxLevel = 60
