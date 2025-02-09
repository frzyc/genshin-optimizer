import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando/engine'
import { fixedTags, queryTypes, type TagMapNodeEntries } from './util'

import { usedNames, usedQ } from '@genshin-optimizer/gameOpt/engine'
import charData from './char'
import common from './common'
import disc from './disc'
import wengine from './wengine'

export const data: TagMapNodeEntries = [
  ...charData,
  ...disc,
  ...wengine,
  ...common,
]
export const keys = compileTagMapKeys([
  { category: 'qt', values: queryTypes },
  { category: 'q', values: usedQ },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({
    category: k,
    values: new Set(v),
  })),
  { category: 'name', values: usedNames },
])
export const values = compileTagMapValues(keys, data)
