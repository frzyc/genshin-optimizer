import type { RarityKey } from './common'

export const allArtifactSetKeys = [
  'Adventurer',
  'ArchaicPetra',
  'Berserker',
  'BlizzardStrayer',
  'BloodstainedChivalry',
  'BraveHeart',
  'CrimsonWitchOfFlames',
  'DeepwoodMemories',
  'DefendersWill',
  'DesertPavilionChronicle',
  'EchoesOfAnOffering',
  'EmblemOfSeveredFate',
  'FlowerOfParadiseLost',
  'Gambler',
  'GildedDreams',
  'GladiatorsFinale',
  'GoldenTroupe',
  'HeartOfDepth',
  'HuskOfOpulentDreams',
  'Instructor',
  'Lavawalker',
  'LuckyDog',
  'MaidenBeloved',
  'MarechausseeHunter',
  'MartialArtist',
  'NighttimeWhispersInTheEchoingWoods',
  'NoblesseOblige',
  'NymphsDream',
  'OceanHuedClam',
  'PaleFlame',
  'PrayersForDestiny',
  'PrayersForIllumination',
  'PrayersForWisdom',
  'PrayersToSpringtime',
  'ResolutionOfSojourner',
  'RetracingBolide',
  'Scholar',
  'ShimenawasReminiscence',
  'SongOfDaysPast',
  'TenacityOfTheMillelith',
  'TheExile',
  'ThunderingFury',
  'Thundersoother',
  'TinyMiracle',
  'TravelingDoctor',
  'VermillionHereafter',
  'ViridescentVenerer',
  'VourukashasGlow',
  'WanderersTroupe',
] as const
export type ArtifactSetKey = (typeof allArtifactSetKeys)[number]

export const allArtifactSlotKeys = [
  'flower',
  'plume',
  'sands',
  'goblet',
  'circlet',
] as const
export type ArtifactSlotKey = (typeof allArtifactSlotKeys)[number]

export const artMaxLevel: Record<RarityKey, number> = {
  1: 4,
  2: 4,
  3: 12,
  4: 16,
  5: 20,
} as const

export const artSubstatRollData: Record<
  RarityKey,
  { low: number; high: number; numUpgrades: number }
> = {
  1: { low: 0, high: 0, numUpgrades: 1 },
  2: { low: 0, high: 1, numUpgrades: 2 },
  3: { low: 1, high: 2, numUpgrades: 3 },
  4: { low: 2, high: 3, numUpgrades: 4 },
  5: { low: 3, high: 4, numUpgrades: 5 },
} as const

export const artifactSandsStatKeys = [
  'hp_',
  'def_',
  'atk_',
  'eleMas',
  'enerRech_',
] as const
export type ArtifactSandsStatKey = (typeof artifactSandsStatKeys)[number]

export const artifactGobletStatKeys = [
  'hp_',
  'def_',
  'atk_',
  'eleMas',
  'physical_dmg_',
  'anemo_dmg_',
  'geo_dmg_',
  'electro_dmg_',
  'hydro_dmg_',
  'pyro_dmg_',
  'cryo_dmg_',
  'dendro_dmg_',
] as const
export type ArtifactGobletStatKey = (typeof artifactGobletStatKeys)[number]

export const artifactCircletStatKeys = [
  'hp_',
  'def_',
  'atk_',
  'eleMas',
  'critRate_',
  'critDMG_',
  'heal_',
] as const
export type ArtifactCircletStatKey = (typeof artifactCircletStatKeys)[number]

/**
 * @deprecated use artSlotMainKeys
 */
export const artSlotsData = {
  flower: { name: 'Flower of Life', stats: ['hp'] as readonly MainStatKey[] },
  plume: { name: 'Plume of Death', stats: ['atk'] as readonly MainStatKey[] },
  sands: {
    name: 'Sands of Eon',
    stats: artifactSandsStatKeys as readonly MainStatKey[],
  },
  goblet: {
    name: 'Goblet of Eonothem',
    stats: artifactGobletStatKeys as readonly MainStatKey[],
  },
  circlet: {
    name: 'Circlet of Logos',
    stats: artifactCircletStatKeys as readonly MainStatKey[],
  },
} as const

export const artSlotMainKeys = {
  flower: ['hp'] as readonly MainStatKey[],
  plume: ['atk'] as readonly MainStatKey[],
  sands: artifactSandsStatKeys as readonly MainStatKey[],
  goblet: artifactGobletStatKeys as readonly MainStatKey[],
  circlet: artifactCircletStatKeys as readonly MainStatKey[],
} as const

export const allMainStatKeys = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
  'physical_dmg_',
  'anemo_dmg_',
  'geo_dmg_',
  'electro_dmg_',
  'hydro_dmg_',
  'pyro_dmg_',
  'cryo_dmg_',
  'dendro_dmg_',
  'heal_',
] as const
export const allSubstatKeys = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
] as const
export type MainStatKey = (typeof allMainStatKeys)[number]
export type SubstatKey = (typeof allSubstatKeys)[number]

// GO currently only support 3-5 star artifacts
export const allArtifactRarityKeys = [5, 4, 3] as const
export type ArtifactRarity = (typeof allArtifactRarityKeys)[number]
