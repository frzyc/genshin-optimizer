import { allElementKeys } from '@genshin-optimizer/consts'
import { max, min, prod, subscript, sum } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { allStatics, percent, reader, self, selfBuff, team } from '../util'
import dmg from './dmg'
import prep from './prep'
import reaction from './reaction'
import { allStats } from '@genshin-optimizer/gi-stats'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,
  ...reaction,

  reader.withTag({ src: 'iso', et: 'self' }).reread(reader.src('custom')),
  reader.withTag({ src: 'agg', et: 'self' }).reread(reader.src('custom')),

  // Final <= Premod <= Base
  reader
    .withTag({ src: 'agg', et: 'self', qt: 'final' })
    .add(reader.with('qt', 'premod').sum),
  reader
    .withTag({ src: 'agg', et: 'self', qt: 'premod' })
    .add(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map((s) =>
    selfBuff.premod[s].add(prod(self.base[s], self.premod[`${s}_`]))
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  selfBuff.common.cappedCritRate_.add(
    max(min(self.final.critRate_, percent(1)), percent(0))
  ),
  selfBuff.trans.cappedCritRate_.add(
    max(min(self.trans.critRate_, percent(1)), percent(0))
  ),

  // Default all elemental `common.count`s to zero
  selfBuff.common.count.add(0),

  // Char & weapon curves
  ...Object.entries(allStats.char.expCurve).map(([k, v]) =>
    allStatics('static')[k].add(subscript(self.char.lvl, v))
  ),
  ...Object.entries(allStats.weapon.expCurve).map(([k, v]) =>
    allStatics('static')[k].add(subscript(self.weapon.lvl, v))
  ),

  // Total element count; this is NOT a `team` stat
  selfBuff.common.eleCount.add(
    sum(...allElementKeys.map((ele) => team.common.count[ele].max))
  ),
]
export default data
