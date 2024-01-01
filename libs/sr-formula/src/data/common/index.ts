import { max, min, prod } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { percent, reader, self, selfBuff } from '../util'
import dmg from './dmg'
import prep from './prep'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,

  reader.withTag({ src: 'iso', et: 'self' }).reread(reader.src('custom')),
  reader.withTag({ src: 'agg', et: 'self' }).reread(reader.src('custom')),

  // convert src:char, lightCone, relic to src:agg for accumulation
  reader.src('agg').add(reader.sum.src('char')),
  reader.src('agg').add(reader.sum.src('lightCone')),
  reader.src('agg').add(reader.sum.src('relic')),

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
export default data
