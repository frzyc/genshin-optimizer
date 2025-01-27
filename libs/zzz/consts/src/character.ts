// copy from libs\zzz\dm\src\dm\character\characterKeys.json
export const allCharacterKeys = [
  'Anby',
  'Anton',
  'Astra',
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
  'PulchraFeliny',
  'QingYi',
  'Rina',
  'Seth',
  'SilverAnby',
  'Soldier11',
  'Soukaku',
  'Trigger',
  'Yanagi',
  'ZhuYuan',
] as const
export type CharacterKey = (typeof allCharacterKeys)[number]

export const allLocationKeys = [...allCharacterKeys, ''] as const
export type LocationKey = (typeof allLocationKeys)[number]

export const allSpecialityKeys = [
  'attack',
  'stun',
  'anomaly',
  'support',
  'defense',
] as const
export type SpecialityKey = (typeof allSpecialityKeys)[number]

export const allAttackTypeKeys = ['slash', 'strike', 'pierce'] as const
export type AttackTypeKey = (typeof allAttackTypeKeys)[number]

export const allCharacterRarityKeys = ['S', 'A'] as const
export type CharacterRarityKey = (typeof allCharacterRarityKeys)[number]

export const ascensionlevel = [10, 20, 30, 40, 50, 60] as const
export const coreLevel = [15, 25, 35, 45, 55, 60] as const

export const allCoreKeys = ['None', 'A', 'B', 'C', 'D', 'E', 'F'] as const
