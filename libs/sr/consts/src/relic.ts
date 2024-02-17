export const allRelicPlanarSlotKeys = ['sphere', 'rope'] as const
export type RelicPlanarSlotKey = (typeof allRelicSlotKeys)[number]

export const allRelicCavernSlotKeys = ['head', 'hand', 'body', 'feet'] as const
export type RelicCavernSlotKey = (typeof allRelicSlotKeys)[number]

export const allRelicSlotKeys = [
  ...allRelicCavernSlotKeys,
  ...allRelicPlanarSlotKeys,
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
  'LongevousDisciple',
  'MessengerTraversingHackerspace',
  'MusketeerOfWildWheat',
  'PasserbyOfWanderingCloud',
  'PioneerDiverOfDeadWaters',
  'PrisonerInDeepConfinement',
  'TheAshblazingGrandDuke',
  'ThiefOfShootingMeteor',
  'WastelanderOfBanditryDesert',
  'WatchmakerMasterOfDreamMachinations',
] as const
export type RelicCavernSetKey = (typeof allRelicCavernSetKeys)[number]

export const allRelicPlanarSetKeys = [
  'BelobogOfTheArchitects',
  'BrokenKeel',
  'CelestialDifferentiator',
  'FirmamentFrontlineGlamoth',
  'FleetOfTheAgeless',
  'InertSalsotto',
  'PanGalacticCommercialEnterprise',
  'PenaconyLandOfTheDreams',
  'RutilantArena',
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

export const allRelicRarityKeys = [2, 3, 4, 5] as const
export type RelicRarityKey = (typeof allRelicRarityKeys)[number]

export const relicMaxLevel: Record<RelicRarityKey, number> = {
  2: 6,
  3: 9,
  4: 12,
  5: 15,
} as const

export const relicSubstatRollData: Record<
  RelicRarityKey,
  { low: number; high: number; numUpgrades: number }
> = {
  2: { low: 0, high: 0, numUpgrades: 0 },
  3: { low: 1, high: 2, numUpgrades: 1 },
  4: { low: 2, high: 3, numUpgrades: 3 },
  5: { low: 3, high: 4, numUpgrades: 5 },
} as const

export const relicSlotToMainStatKeys: Record<RelicSlotKey, RelicMainStatKey[]> =
  {
    head: ['hp'],
    hand: ['atk'],
    body: ['hp_', 'atk_', 'def_', 'eff_', 'heal_', 'crit_', 'crit_dmg_'],
    feet: ['hp_', 'atk_', 'def_', 'spd'],
    sphere: [
      'hp_',
      'atk_',
      'def_',
      'physical_dmg_',
      'fire_dmg_',
      'ice_dmg_',
      'wind_dmg_',
      'lightning_dmg_',
      'quantum_dmg_',
      'imaginary_dmg_',
    ],
    rope: ['brEff_', 'enerRegen_'],
  }
