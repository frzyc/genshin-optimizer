import { max, min, prod } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { percent, reader, self, selfBuff } from '../util'
import dmg from './dmg'
import prep from './prep'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,

  reader.withTag({ sheet: 'iso', et: 'self' }).reread(reader.sheet('custom')),
  reader.withTag({ sheet: 'agg', et: 'self' }).reread(reader.sheet('custom')),

  // convert sheet:<char/lightCone> to sheet:agg for accumulation
  // sheet:<relic> is reread in src/util.ts:relicsData()
  reader.sheet('agg').reread(reader.sheet('char')),
  reader.sheet('agg').reread(reader.sheet('lightCone')),

  // Final <= Premod <= Base
  reader
    .withTag({ sheet: 'agg', et: 'self', qt: 'final' })
    .add(reader.with('qt', 'premod').sum),
  reader
    .withTag({ sheet: 'agg', et: 'self', qt: 'premod' })
    .add(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp', 'spd'] as const).map((s) =>
    selfBuff.premod[s].add(prod(self.base[s], self.premod[`${s}_`]))
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  selfBuff.common.cappedCrit_.add(
    max(min(self.final.crit_, percent(1)), percent(0))
  ),

  // Default conditionals to 0
  reader.with('qt', 'cond').add(0),
]
export default data
