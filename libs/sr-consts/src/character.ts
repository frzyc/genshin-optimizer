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

export const allElementalTypeKeys = [
  'Physical',
  'Quantum',
  'Lightning',
  'Ice',
  'Wind',
  'Fire',
  'Imaginary',
] as const
export type ElementalTypeKey = (typeof allElementalTypeKeys)[number]

export const allPathKeys = [
  'Erudition',
  'Preservation',
  'Abundance',
  'Nihility',
  'Destruction',
  'Harmony',
  'TheHunt',
] as const
export type PathKey = (typeof allPathKeys)[number]

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
  ...allTrailblazerKeys,
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

export const allEidolonKeys = [1, 2, 3, 4, 5, 6] as const
export type EidolonKey = (typeof allEidolonKeys)[number]

export const allAbilityKeys = [
  'basic',
  'skill',
  'ult',
  'talent',
  'technique',
] as const
export type AbilityKey = (typeof allAbilityKeys)[number]

export function charKeyToCharLocKey(
  charKey: CharacterKey
): CharacterLocationKey {
  return charKey.includes('Trailblazer')
    ? 'Trailblazer'
    : (charKey as CharacterLocationKey)
}
