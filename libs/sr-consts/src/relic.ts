export const allRelicPlanarSlotKeys = ['rope', 'sphere'] as const
export type RelicPlanarSlotKey = (typeof allRelicSlotKeys)[number]

export const allRelicCavernSlotKeys = ['head', 'hand', 'body', 'feet'] as const
export type RelicCavernSlotKey = (typeof allRelicSlotKeys)[number]

export const allRelicSlotKeys = [
  ...allRelicPlanarSlotKeys,
  ...allRelicCavernSlotKeys,
] as const
export type RelicSlotKey = (typeof allRelicSlotKeys)[number]

export const allRelicCavernSetKeys = [
  'BandOfSizzlingThunder',
  'ChampionOfStreetwiseBoxing',
  'EagleOfTwilightLine',
  'FiresmithOfLavaForging',
  'GeniusOfBrilliantStars',
  'GuardOfWutheringSnow',
  'HunterOfGlacialForest',
  'KnightOfPurityPalace',
  'MusketeerOfWildWheat',
  'PasserbyOfWanderingCloud',
  'ThiefOfShootingMeteor',
  'WastelanderOfBanditryDesert',
] as const
export type RelicCavernSetKey = (typeof allRelicCavernSetKeys)[number]

export const allRelicPlanarSetKeys = [
  'BelobogOfTheArchitects',
  'CelestialDifferentiator',
  'FleetOfTheAgeless',
  'InertSalsotto',
  'PanGalacticCommercialEnterprise',
  'SpaceSealingStation',
  'SprightlyVonwacq',
  'TaliaKingdomOfBanditry',
] as const
export type RelicPlanarSetKey = (typeof allRelicPlanarSetKeys)[number]

export const allRelicSetKeys = [
  ...allRelicCavernSetKeys,
  ...allRelicPlanarSetKeys,
] as const

export type RelicSetKey = (typeof allRelicSetKeys)[number]

export const allRelicSubStatKeys = [
  'hp',
  'atk',
  'def',
  'hp_',
  'atk_',
  'def_',
  'spd',
  'crit_',
  'crit_dmg_',
  'eff_',
  'eff_res_',
  'brEff_',
] as const

export type RelicSubStatKey = (typeof allRelicSubStatKeys)[number]

export const allRelicMainStatKeys = [
  'hp',
  'atk',
  'hp_',
  'atk_',
  'def_',
  'crit_',
  'crit_dmg_',
  'heal_',
  'eff_',
  'spd',
  'physical_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'lightning_dmg_',
  'wind_dmg_',
  'quantum_dmg_',
  'imaginary_dmg_',
  'brEff_',
  'enerRegen_',
] as const

export type RelicMainStatKey = (typeof allRelicMainStatKeys)[number]
