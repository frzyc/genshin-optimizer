import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'

const stats = [
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
  'dmg_',
  'heal_',
] as const

export const presets = [
  'preset0',
  'preset1',
  'preset2',
  'preset3',
  'preset4',
  'preset5',
  'preset6',
  'preset7',
  'preset8',
  'preset9',
] as const
export const entryTypes = [
  'own',
  'enemy',
  'team',
  'target',
  'teamBuff',
  'notOwnBuff',
  'enemyDeBuff', // Ends with 'Buff' so `Calculator` can pick up on this tag
] as const
export const sheets = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allWeaponKeys,
  ...allArtifactSetKeys,
  'art',
  'reso',
  'dyn',
  'enemy',
  'custom',
] as const
export const members = ['0', '1', '2', '3'] as const

export type Stat = (typeof stats)[number]
export type Preset = (typeof presets)[number]
export type EntryType = (typeof entryTypes)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
