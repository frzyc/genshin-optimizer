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

export const allCharacterKeys = [...nonTrailblazerCharacterKeys] as const
export type CharacterKey = (typeof allCharacterKeys)[number]

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

export const allTrailblazerGeneredKeys = [
  "TrailBlazerPhysicalM",
  "TrailBlazerPhysicalF",
  "TrailBlazerFireM",
  "TrailBlazerFireF"
] as const
export type TrailBlazerGeneredKey = (typeof allTrailblazerGeneredKeys)[number]
