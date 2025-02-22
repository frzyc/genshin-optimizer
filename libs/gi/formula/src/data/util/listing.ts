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
export type Sheet = (typeof sheets)[number]
export type Member = (typeof members)[number]
export type Src = Member | null
export type Dst = Member | null
