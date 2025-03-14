export const allRelicPlanarSlotKeys = ['sphere', 'rope'] as const
export type RelicPlanarSlotKey = (typeof allRelicPlanarSlotKeys)[number]

export const allRelicCavernSlotKeys = ['head', 'hands', 'body', 'feet'] as const
export type RelicCavernSlotKey = (typeof allRelicCavernSlotKeys)[number]

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
  'HeroOfTriumphantSong',
  'HunterOfGlacialForest',
  'IronCavalryAgainstTheScourge',
  'KnightOfPurityPalace',
  'LongevousDisciple',
  'MessengerTraversingHackerspace',
  'MusketeerOfWildWheat',
  'PasserbyOfWanderingCloud',
  'PioneerDiverOfDeadWaters',
  'PoetOfMourningCollapse',
  'PrisonerInDeepConfinement',
  'SacerdosRelivedOrdeal',
  'ScholarLostInErudition',
  'TheAshblazingGrandDuke',
  'TheWindSoaringValorous',
  'ThiefOfShootingMeteor',
  'WastelanderOfBanditryDesert',
  'WatchmakerMasterOfDreamMachinations',
] as const
export type RelicCavernSetKey = (typeof allRelicCavernSetKeys)[number]

export const allRelicPlanarSetKeys = [
  'BelobogOfTheArchitects',
  'BoneCollectionsSereneDemesne',
  'BrokenKeel',
  'CelestialDifferentiator',
  'DuranDynastyOfRunningWolves',
  'FirmamentFrontlineGlamoth',
  'FleetOfTheAgeless',
  'ForgeOfTheKalpagniLantern',
  'GiantTreeOfRaptBrooding',
  'InertSalsotto',
  'IzumoGenseiAndTakamaDivineRealm',
  'LushakaTheSunkenSeas',
  'PanCosmicCommercialEnterprise',
  'PenaconyLandOfTheDreams',
  'RutilantArena',
  'SigoniaTheUnclaimedDesolation',
  'SpaceSealingStation',
  'SprightlyVonwacq',
  'TaliaKingdomOfBanditry',
  'TheWondrousBananAmusementPark',
] as const
export type RelicPlanarSetKey = (typeof allRelicPlanarSetKeys)[number]

export const allRelicSetKeys = [
  ...allRelicCavernSetKeys,
  ...allRelicPlanarSetKeys,
] as const
export type RelicSetKey = (typeof allRelicSetKeys)[number]

// WARN: do not change order, since this is the order of display of substats in game.
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
  'brEffect_',
] as const
export type RelicSubStatKey = (typeof allRelicSubStatKeys)[number]
export const allElementalDmgMainStatKeys = [
  'physical_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'lightning_dmg_',
  'wind_dmg_',
  'quantum_dmg_',
  'imaginary_dmg_',
] as const
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
  ...allElementalDmgMainStatKeys,
  'brEffect_',
  'enerRegen_',
] as const

export type RelicMainStatKey = (typeof allRelicMainStatKeys)[number]

export const allRelicRarityKeys = [2, 3, 4, 5] as const
export type RelicRarityKey = (typeof allRelicRarityKeys)[number]

export function isRelicRarityKey(rarity: unknown): rarity is RelicRarityKey {
  return (
    typeof rarity === 'number' &&
    allRelicRarityKeys.includes(rarity as RelicRarityKey)
  )
}

export const allRelicSetCountKeys = [2, 4] as const
export type RelicSetCountKey = (typeof allRelicSetCountKeys)[number]

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
    hands: ['atk'],
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
    rope: ['hp_', 'atk_', 'def_', 'brEffect_', 'enerRegen_'],
  }

export const allRelicMainSubStatKeys = Array.from(
  new Set([...allRelicSubStatKeys, ...allRelicMainStatKeys] as const),
)
export type RelicMainSubStatKey = (typeof allRelicMainSubStatKeys)[number]

export function isCavernRelicSetKey(
  key: RelicSetKey,
): key is RelicCavernSetKey {
  return allRelicCavernSetKeys.includes(key as RelicCavernSetKey)
}

export function isPlanarRelicSetKey(
  key: RelicSetKey,
): key is RelicPlanarSetKey {
  return allRelicPlanarSetKeys.includes(key as RelicPlanarSetKey)
}

export function isRelicSetKey(key: unknown): key is RelicSetKey {
  return (
    typeof key === 'string' &&
    (isCavernRelicSetKey(key as RelicSetKey) ||
      isPlanarRelicSetKey(key as RelicSetKey))
  )
}
