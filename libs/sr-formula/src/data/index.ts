import {
  compileTagMapKeys,
  compileTagMapValues,
  read,
} from '@genshin-optimizer/pando'
import {
  fixedTags,
  queries,
  queryTypes,
  usedNames,
  type TagMapNodeEntries,
} from './util'

import charData from './char'
import lcData from './lightcone'

const data: TagMapNodeEntries = [
  ...charData,
  ...lcData,
  // convert src:char to src:total for accumulation
  {
    tag: { src: 'agg' },
    value: read({ src: 'char' }, 'sum'),
  },
  // convert src:lightcone to src:total for accumulation
  {
    tag: { src: 'agg' },
    value: read({ src: 'lightcone' }, 'sum'),
  },
]
const tags = [
  { category: 'qt', values: [...queryTypes] },
  { category: 'q', values: ['_', ...queries] },
  undefined,
  ...Object.entries(fixedTags).map(([k, v]) => ({ category: k, values: v })),
  { category: 'name', values: [...usedNames] },
]
export const keys = compileTagMapKeys(tags)
export const values = compileTagMapValues(keys, data)
