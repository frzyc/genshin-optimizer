import type { RelicSetKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'

export const relicSetIdMap: Record<string, RelicSetKey> = {
  101: 'PasserbyOfWanderingCloud',
  102: 'MusketeerOfWildWheat',
  103: 'KnightOfPurityPalace',
  104: 'HunterOfGlacialForest',
  105: 'ChampionOfStreetwiseBoxing',
  106: 'GuardOfWutheringSnow',
  107: 'FiresmithOfLavaForging',
  108: 'GeniusOfBrilliantStars',
  109: 'BandOfSizzlingThunder',
  110: 'EagleOfTwilightLine',
  111: 'ThiefOfShootingMeteor',
  112: 'WastelanderOfBanditryDesert',
  113: 'LongevousDisciple',
  114: 'MessengerTraversingHackerspace',
  115: 'TheAshblazingGrandDuke',
  116: 'PrisonerInDeepConfinement',
  117: 'PioneerDiverOfDeadWaters',
  118: 'WatchmakerMasterOfDreamMachinations',
  119: 'IronCavalryAgainstTheScourge',
  120: 'TheWindSoaringValorous',
  121: 'SacerdosRelivedOrdeal',
  122: 'ScholarLostInErudition',
  123: 'HeroOfTriumphantSong',
  124: 'PoetOfMourningCollapse',

  301: 'SpaceSealingStation',
  302: 'FleetOfTheAgeless',
  303: 'PanCosmicCommercialEnterprise',
  304: 'BelobogOfTheArchitects',
  305: 'CelestialDifferentiator',
  306: 'InertSalsotto',
  307: 'TaliaKingdomOfBanditry',
  308: 'SprightlyVonwacq',
  309: 'RutilantArena',
  310: 'BrokenKeel',
  311: 'FirmamentFrontlineGlamoth',
  312: 'PenaconyLandOfTheDreams',
  313: 'SigoniaTheUnclaimedDesolation',
  314: 'IzumoGenseiAndTakamaDivineRealm',
  315: 'DuranDynastyOfRunningWolves',
  316: 'ForgeOfTheKalpagniLantern',
  317: 'LushakaTheSunkenSeas',
  318: 'TheWondrousBananAmusementPark',
  319: 'BoneCollectionsSereneDemesne',
  320: 'GiantTreeOfRaptBrooding',
}
export type RelicSetId = keyof typeof relicSetIdMap

export const relicSlotMap: Record<RelicSlotDMKey, RelicSlotKey> = {
  HEAD: 'head',
  HAND: 'hands',
  BODY: 'body',
  FOOT: 'feet',
  NECK: 'sphere',
  OBJECT: 'rope',
} as const

export type RelicSlotDMKey =
  | 'BODY'
  | 'FOOT'
  | 'HAND'
  | 'HEAD'
  | 'NECK'
  | 'OBJECT'

export const allRelicStatSubDMKeys = [
  'HPDelta',
  'AttackDelta',
  'DefenceDelta',
  'HPAddedRatio',
  'AttackAddedRatio',
  'DefenceAddedRatio',
  'SpeedDelta',
  'CriticalChanceBase',
  'CriticalDamageBase',
  'StatusProbabilityBase',
  'StatusResistanceBase',
  'BreakDamageAddedRatioBase',
] as const
export type RelicStatSubDMKey = (typeof allRelicStatSubDMKeys)[number]

export const allRelicStatMainDMKeys = [
  'HPDelta',
  'AttackDelta',
  'HPAddedRatio',
  'AttackAddedRatio',
  'DefenceAddedRatio',
  'CriticalChanceBase',
  'CriticalDamageBase',
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
  'BreakDamageAddedRatioBase',
  'SPRatioBase',
] as const
export type RelicStatMainDMKey = (typeof allRelicStatMainDMKeys)[number]

export type RelicStatDMKey = RelicStatSubDMKey | RelicStatMainDMKey
