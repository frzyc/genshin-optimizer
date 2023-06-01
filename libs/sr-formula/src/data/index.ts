import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/waverider'
import type { TaggedFormulas } from './util'

import { allCharacterKeys } from "@genshin-optimizer/sr-consts"
import { data as charData } from './char'
const stats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'spd',
  'crit_',
  'crit_dmg_',
  'taunt',
] as const

const srcs = [
  ...allCharacterKeys,
] as const
export type Stat = (typeof stats)[number]
export type Source = (typeof srcs)[number]

const data: TaggedFormulas = [
  ...charData
]
// TODO: hoist this type from wr2 lib
type Tags = Parameters<typeof compileTagMapKeys>[0]
const tags: Tags = [
  { category: "src", values: [...allCharacterKeys] },
  { category: "qt", values: ["base"] },
  { category: "q", values: [...stats, "lvl", "ascension"] },
]
export const keys = compileTagMapKeys(tags)
export const values = compileTagMapValues(keys, data)
