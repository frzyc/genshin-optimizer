import type {
  CharacterRarityKey,
  ElementalKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'

// Copied from libs\zzz\dm\src\dm\character\characterIdMap.json
export const characterIdMap = {
  '1011': 'Anby',
  '1021': 'Nekomata',
  '1031': 'Nicole',
  '1041': 'Soldier11',
  '1061': 'Corin',
  '1071': 'Caesar',
  '1081': 'Billy',
  '1091': 'Miyabi',
  '1101': 'Koleda',
  '1111': 'Anton',
  '1121': 'Ben',
  '1131': 'Soukaku',
  '1141': 'Lycaon',
  '1151': 'Lucy',
  '1161': 'Lighter',
  '1171': 'Burnice',
  '1181': 'Grace',
  '1191': 'Ellen',
  '1201': 'Harumasa',
  '1211': 'Rina',
  '1221': 'Yanagi',
  '1241': 'ZhuYuan',
  '1251': 'QingYi',
  '1261': 'Jane',
  '1271': 'Seth',
  '1281': 'Piper',
  '1311': 'Astra',
  '1321': 'Evelyn',
  '1351': 'PulchraFeliny',
  '1361': 'Trigger',
  '1381': 'SilverAnby',
} as const

export const attributeMap: Record<number, ElementalKey> = {
  200: 'physical',
  201: 'fire',
  202: 'ice',
  203: 'electric',
  205: 'ether',
} as const
export const specialityMap: Record<number, SpecialityKey> = {
  1: 'attack',
  2: 'stun',
  3: 'anomaly',
  4: 'support',
  5: 'defense',
} as const

export const characterRarityMap: Record<number, CharacterRarityKey> = {
  3: 'A',
  4: 'S',
} as const

export const coreStatMap: Record<string, string> = {
  'Base ATK': 'atk_base',
  Impact: 'impact',
  'CRIT Rate': 'crit_',
  'CRIT DMG': 'crit_dmg_',
  'Base Energy Regen': 'base_enerRegen',
  'Anomaly Proficiency': 'anomProf',
  'Anomaly Mastery': 'anomMas',
  'PEN Ratio': 'pen_',
} as const
