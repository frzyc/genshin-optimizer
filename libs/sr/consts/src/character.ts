import type { PathKey } from './common'

export const allGenderKeys = ['F', 'M'] as const
export type GenderKey = (typeof allGenderKeys)[number]

export const nonTrailblazerCharacterKeys = [
  'Acheron',
  'Argenti',
  'Arlan',
  'Asta',
  'Aventurine',
  'Bailu',
  'BlackSwan',
  'Blade',
  'Boothill',
  'Bronya',
  'Clara',
  'DanHeng',
  'DanHengImbibitorLunae',
  'DrRatio',
  'Firefly',
  'FuXuan',
  'Gallagher',
  'Gepard',
  'Guinaifen',
  'Hanya',
  'Herta',
  'Himeko',
  'Hook',
  'Huohuo',
  'Jade',
  'JingYuan',
  'Jingliu',
  'Kafka',
  'Luka',
  'Luocha',
  'Lynx',
  'March7th',
  'March7thTheHunt',
  'Misha',
  'Natasha',
  'Pela',
  'Qingque',
  'Robin',
  'RuanMei',
  'Sampo',
  'Seele',
  'Serval',
  'SilverWolf',
  'Sparkle',
  'Sushang',
  'Tingyun',
  'TopazAndNumby',
  'Welt',
  'Xueyi',
  'Yanqing',
  'Yukong',
  'Yunli',
] as const
export type NonTrailblazerCharacterKey =
  (typeof nonTrailblazerCharacterKeys)[number]

export const allElementalTypeKeys = [
  'physical',
  'quantum',
  'lightning',
  'ice',
  'wind',
  'fire',
  'imaginary',
] as const
export type ElementalTypeKey = (typeof allElementalTypeKeys)[number]

export const allTrailblazerGenderedKeys = [
  'TrailblazerPhysicalM',
  'TrailblazerPhysicalF',
  'TrailblazerFireM',
  'TrailblazerFireF',
  'TrailblazerImaginaryM',
  'TrailblazerImaginaryF',
] as const
export type TrailblazerGenderedKey = (typeof allTrailblazerGenderedKeys)[number]

export const allTrailblazerKeys = [
  'TrailblazerPhysical',
  'TrailblazerFire',
  'TrailblazerImaginary',
] as const
export type TrailblazerKey = (typeof allTrailblazerKeys)[number]
export const TrailblazerPathMap: Record<TrailblazerKey, PathKey> = {
  TrailblazerPhysical: 'Destruction',
  TrailblazerFire: 'Preservation',
  TrailblazerImaginary: 'Harmony',
}

export const allCharacterKeys = [
  ...nonTrailblazerCharacterKeys,
  ...allTrailblazerKeys,
] as const
export type CharacterKey = (typeof allCharacterKeys)[number]

export const allCharacterGenderedKeys = [
  ...nonTrailblazerCharacterKeys,
  ...allTrailblazerGenderedKeys,
] as const
export type CharacterGenderedKey = (typeof allCharacterGenderedKeys)[number]

export function characterGenderedKeyToCharacterKey(
  cgKey: CharacterGenderedKey
): CharacterKey {
  if (cgKey.includes('Trailblazer')) {
    return cgKey.slice(0, -1) as TrailblazerKey
  }
  return cgKey as NonTrailblazerCharacterKey
}

export const maxEidolonCount = 6 as const

export const allLocationKeys = [...allCharacterKeys, ''] as const
export type LocationKey = (typeof allLocationKeys)[number]

export const allBonusAbilityKeys = [1, 2, 3] as const
export type BonusAbilityKey = (typeof allBonusAbilityKeys)[number]

export const allStatBoostKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type StatBoostKey = (typeof allStatBoostKeys)[number]

export const allEidolonKeys = [0, 1, 2, 3, 4, 5, 6] as const
export type EidolonKey = (typeof allEidolonKeys)[number]

export const allAbilityKeys = [
  'basic',
  'skill',
  'ult',
  'talent',
  'technique', // MAZE
  'overworld', // MAZE_NORMAL
] as const
export type AbilityKey = (typeof allAbilityKeys)[number]

// TODO: need to check for correctness
export const talentLimits = [1, 1, 2, 4, 6, 8, 10] as const

export function isTrailblazerKey(key: CharacterKey): key is TrailblazerKey {
  return allTrailblazerKeys.includes(key as TrailblazerKey)
}
