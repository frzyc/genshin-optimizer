import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr-consts'

const stats = [
  'hp',
  'atk',
  'def',
  'spd',
  'crit_',
  'crit_dmg_',
  'taunt',
] as const

export const moves = ['basic', 'skill', 'ult', 'followup', 'dot'] as const

export const entryTypes = [
  'self',
  'teamBuff',
  'enemy',
  'team',
  'target',
] as const
export const srcs = [
  'agg',
  'iso',
  'static',
  ...allCharacterKeys,
  ...allLightConeKeys,
  ...allRelicSetKeys,
  'char',
  'lightCone',
  'relic',
  'dyn',
  'enemy',
  'custom',
] as const
export const members = ['member0', 'member1', 'member2', 'member3'] as const

export type Stat = (typeof stats)[number]
export type Move = (typeof moves)[number]
export type EntryType = (typeof entryTypes)[number]
export type Source = (typeof srcs)[number]
export type Member = (typeof members)[number]
