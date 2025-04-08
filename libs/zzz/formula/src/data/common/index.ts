import { max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import {
  flatAndPercentStats,
  nonFlatAndPercentStats,
  own,
  ownBuff,
  percent,
  reader,
} from '../util'
import anomalyBuildup from './anomalyBuildup'
import daze from './daze'
import dmg from './dmg'
import prep from './prep'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,
  ...anomalyBuildup,
  ...daze,

  reader.withTag({ sheet: 'iso', et: 'own' }).reread(reader.sheet('custom')),
  reader.withTag({ sheet: 'agg', et: 'own' }).reread(reader.sheet('custom')),

  // convert sheet:<char> to sheet:agg for accumulation
  // sheet:<wengine> is reread in src/util.ts:wengineTagMapNodeEntries()
  // sheet:<disc> is reread in src/util.ts:discTagMapNodeEntries()
  reader
    .sheet('agg')
    .reread(reader.sheet('char')),

  // For stats with a flat and percent variant
  // initial x += base x * initial x%
  ...flatAndPercentStats.map((s) =>
    ownBuff.initial[s].add(
      prod(own.base[s], sum(percent(1), own.initial[`${s}_`]))
    )
  ),

  // For stats with a flat and percent variant
  // final x += initial X * combat X% + combat X
  ...flatAndPercentStats.map((s) =>
    ownBuff.final[s].add(
      sum(
        prod(own.initial[s], sum(percent(1), own.combat[`${s}_`])),
        own.combat[s]
      )
    )
  ),

  // For stats with only 1 variant
  // initial x += base X; assuming base exists for that stat
  ...nonFlatAndPercentStats
    .filter((s) => s in ownBuff.base)
    .map(
      (s) =>
        ownBuff.initial[s].add(
          ownBuff.base[s as keyof typeof ownBuff.base],
          true
        ) // Validated with filter
    ),
  // final x += initial X + combat X
  ...nonFlatAndPercentStats.map((s) =>
    ownBuff.final[s].add(sum(own.initial[s], own.combat[s]), true)
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  ownBuff.common.cappedCrit_.add(
    max(min(own.final.crit_, percent(1)), percent(0))
  ),

  // Default conditionals to 0
  reader
    .with('qt', 'cond')
    .add(0),
]
export default data
