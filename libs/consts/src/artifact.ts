import { RarityKey } from './common'

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
  'HeartOfDepth',
  'HuskOfOpulentDreams',
  'Instructor',
  'Lavawalker',
  'LuckyDog',
  'MaidenBeloved',
  'MartialArtist',
  'NoblesseOblige',
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
  'TenacityOfTheMillelith',
  'TheExile',
  'ThunderingFury',
  'Thundersoother',
  'TinyMiracle',
  'TravelingDoctor',
  'VermillionHereafter',
  'ViridescentVenerer',
  'WanderersTroupe',
] as const
export type ArtifactSetKey = typeof allArtifactSetKeys[number]

export const allArtifactSlotKeys = ['flower', 'plume', 'sands', 'goblet', 'circlet'] as const
export type ArtifactSlotKey = typeof allArtifactSlotKeys[number]

export const artMaxLevel: Record<RarityKey, number> = {
  1: 4,
  2: 4,
  3: 12,
  4: 16,
  5: 20,
} as const
