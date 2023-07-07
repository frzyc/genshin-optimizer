import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/pando'
import {
  fixedTags,
  queryTypes,
  reader,
  usedNames,
  usedQ,
  type TagMapNodeEntries,
} from './util'

import charData from './char'
import lcData from './lightcone'

const data: TagMapNodeEntries = [
  ...charData,
  ...lcData,
  // convert src:char to src:total for accumulation
  reader.src('agg').add(reader.sum.src('char')),
  // convert src:lightcone to src:total for accumulation
  reader.src('agg').add(reader.sum.src('lightcone')),
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
