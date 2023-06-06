import {
  compileTagMapKeys,
  compileTagMapValues,
  read,
} from '@genshin-optimizer/waverider'
import type { TaggedFormulas } from './util'

import {
  allCharacterKeys,
  allLightConeKeys,
} from '@genshin-optimizer/sr-consts'
import { data as charData } from './char'
import { data as lcData } from './lightcone'
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

const srcs = [...allCharacterKeys] as const
export type Stat = (typeof stats)[number]
export type Source = (typeof srcs)[number]

const data: TaggedFormulas = [
  ...charData,
  ...lcData,
  // convert st:char to st:total for accumulation
  {
    tag: { st: 'total' },
    value: read({ st: 'char' }, 'sum'),
  },
  // convert st:lightcone to st:total for accumulation
  {
    tag: { st: 'total' },
    value: read({ st: 'lightcone' }, 'sum'),
  },
]
// TODO: hoist this type from wr2 lib
type Tags = Parameters<typeof compileTagMapKeys>[0]
const tags: Tags = [
  // src are where the "buffs" come from
  { category: 'src', values: [...allCharacterKeys, ...allLightConeKeys] },
  // Source Type
  { category: 'st', values: ['char', 'lightcone', 'total'] },
  { category: 'qt', values: ['base'] },
  { category: 'q', values: [...stats, 'lvl', 'ascension'] },
]
export const keys = compileTagMapKeys(tags)
export const values = compileTagMapValues(keys, data)
