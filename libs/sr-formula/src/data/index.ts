import {
  compileTagMapKeys,
  compileTagMapValues,
  max,
  min,
  prod,
} from '@genshin-optimizer/pando'
import {
  fixedTags,
  percent,
  queryTypes,
  reader,
  self,
  selfBuff,
  usedNames,
  usedQ,
  type TagMapNodeEntries,
} from './util'

import charData from './char'
import lcData from './lightCone'

const data: TagMapNodeEntries = [
  ...charData,
  ...lcData,
  // convert src:char to src:total for accumulation
  reader.src('agg').add(reader.sum.src('char')),
  // convert src:lightCone to src:total for accumulation
  reader.src('agg').add(reader.sum.src('lightCone')),

  // Final <= Premod <= Base
  reader
    .withTag({ src: 'agg', et: 'self', qt: 'final' })
    .add(reader.with('qt', 'premod').sum),
  reader
    .withTag({ src: 'agg', et: 'self', qt: 'premod' })
    .add(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp', 'spd'] as const).map((s) =>
    selfBuff.premod[s].add(prod(self.base[s], self.premod[`${s}_`]))
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  selfBuff.common.cappedCrit_.add(
    max(min(self.final.crit_, percent(1)), percent(0))
  ),
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
