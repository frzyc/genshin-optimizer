import type {
  ArtifactSetKey,
  NonTravelerCharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'

// Keys that should have data fetched from Hakushin instead of regular DM
export const hakushinChars: NonTravelerCharacterKey[] = [
  'Iansan',
  'Varesa',
  'Escoffier',
  'Ifa',
  'Skirk',
  'Dahlia',
  'Ineffa',
] as const
export const hakushinArtis: ArtifactSetKey[] = [
  'FinaleOfTheDeepGalleries',
  'LongNightsOath',
] as const
export const hakushinWeapons: WeaponKey[] = [
  'VividNotions',
  'SymphonistOfScents',
  'SequenceOfSolitude',
  'Azurelight',
  'FracturedHalo',
  'FlameForgedInsight',
] as const
