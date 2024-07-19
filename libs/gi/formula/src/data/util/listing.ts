import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'

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
  'selfBuff',
  'teamBuff',
  'notSelfBuff',
  'enemy',
  'team',
  'target',
] as const
export const sheets = [
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
export const members = ['all', '0', '1', '2', '3'] as const

export type Stat = SubstatKey | MainStatKey
export type Preset = (typeof presets)[number]
export type EntryType = (typeof entryTypes)[number]
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
