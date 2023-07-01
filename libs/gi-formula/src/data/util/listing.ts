import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/consts'

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
  'self',
  'teamBuff',
  'active',
  'enemy',
  'team',
  'target',
] as const
export const srcs = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allWeaponKeys,
  ...allArtifactSetKeys,
  'art',
  'dyn',
  'enemy',
  'custom',
] as const
export const members = ['member0', 'member1', 'member2', 'member3'] as const

export type Stat = (typeof stats)[number]
export type Preset = (typeof presets)[number]
export type EntryType = (typeof entryTypes)[number]
export type Source = (typeof srcs)[number]
export type Member = (typeof members)[number]
