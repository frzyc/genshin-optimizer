import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando/engine'

import charData from './char'
import common from './common'
import lcData from './lightCone'
import {
  fixedTags,
  queryTypes,
  type TagMapNodeEntries,
  usedNames,
  usedQ,
} from './util'

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
