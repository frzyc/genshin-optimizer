import {
  compileTagMapKeys,
  compileTagMapValues,
} from '@genshin-optimizer/waverider'
import { TaggedFormulas } from './util'

const data: TaggedFormulas = [
  // TODO: Add global DB entries
]
const tags = [
  // TODO: Add appropriate categories and values
  { category: 'cat1', values: ['value1', 'value2', 'value3'] },
  undefined, // Force tags to be in different encoded words
  { category: 'cat2', values: ['value1', 'value2', 'value3'] },
]
const keys = compileTagMapKeys(tags) // TODO: Find optimum tag order
const values = compileTagMapValues(keys, data)

export { keys, values, data }
