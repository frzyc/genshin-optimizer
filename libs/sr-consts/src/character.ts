export const allGenderKeys = ['F', 'M'] as const
export type GenderKey = (typeof allGenderKeys)[number]

export const nonTrailblazerCharacterKeys = [
  'Arlan',
  'Asta',
  'Bailu',
  'Bronya',
  'Clara',
  'DanHeng',
  'Gepard',
  'Herta',
  'Himeko',
  'Hook',
  'JingYuan',
  'Kafka',
  'Luocha',
  'March7th',
  'Natasha',
  'Pela',
  'Qingque',
  'Sampo',
  'Seele',
  'Serval',
  'SilverWolf',
  'Sushang',
  'Tingyun',
  'Welt',
  'Yanqing',
] as const
export type NonTrailblazerCharacterKey =
  (typeof nonTrailblazerCharacterKeys)[number]

export const damageType = [
  'Physical',
  'Quantum',
  'Thunder',
  'Ice',
  'Wind',
  'Fire',
  'Imaginary',
] as const
export type DamageTypeKey = (typeof damageType)[number]

export const path = [
  'Erudition',
  'Preservation',
  'Abundance',
  'Nihility',
  'Destruction',
  'Harmony',
  'TheHunt',
] as const
export type PathKey = (typeof path)[number]

export const allTrailblazerGenderedKeys = [
  'TrailblazerPhysicalM',
  'TrailblazerPhysicalF',
  'TrailblazerFireM',
  'TrailblazerFireF',
] as const
export type TrailblazerGenderedKey = (typeof allTrailblazerGenderedKeys)[number]

export const allTrailblazerKeys = [
  'TrailblazerPhysical',
  'TrailblazerFire',
] as const
export type TrailblazerKey = (typeof allTrailblazerKeys)[number]

export const allCharacterKeys = [
  ...nonTrailblazerCharacterKeys,
  ...allTrailblazerGenderedKeys,
] as const
export type CharacterKey = (typeof allCharacterKeys)[number]

export const allCharacterLocationKeys = [
  ...nonTrailblazerCharacterKeys,
  'Trailblazer',
] as const
export type CharacterLocationKey = (typeof allCharacterLocationKeys)[number]

export const allLocationKeys = [...allCharacterLocationKeys, ''] as const
export type LocationKey = (typeof allLocationKeys)[number]

export const allBonusAbilityKeys = [1, 2, 3] as const
export type BonusAbilityKey = (typeof allBonusAbilityKeys)[number]

export const allStatBoostKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export type StatBoostKey = (typeof allStatBoostKeys)[number]
