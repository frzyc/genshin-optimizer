import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando/engine'
import {
  fixedTags,
  queryTypes,
  usedNames,
  usedQ,
  type TagMapNodeEntries,
} from './util'

import charData from './char'
import common from './common'
import lcData from './lightCone'

export const data: TagMapNodeEntries = [...charData, ...lcData, ...common]
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
