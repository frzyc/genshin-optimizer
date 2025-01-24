export const allCharacterKeys = [
  'Anby',
  'Anton',
  'AstraYao',
  'Ben',
  'Billy',
  'Burnice',
  'Caesar',
  'Corin',
  'Ellen',
  'Evelyn',
  'Grace',
  'Harumasa',
  'Jane',
  'Koleda',
  'Lighter',
  'Lucy',
  'Lycaon',
  'Miyabi',
  'Nekomata',
  'Nicole',
  'Piper',
  'Qingyi',
  'Rina',
  'Seth',
  'Soldier11',
  'Soukaku',
  'Yanagi',
  'ZhuYuan',
] as const
export type CharacterKey = (typeof allCharacterKeys)[number]

export const allLocationKeys = [...allCharacterKeys, ''] as const
export type LocationKey = (typeof allLocationKeys)[number]
