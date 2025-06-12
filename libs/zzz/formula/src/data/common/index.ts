import { cmpEq, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
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
  // Except sheer force because we gotta calculate that all funky
  ...nonFlatAndPercentStats
    .filter(
      (s): s is keyof typeof ownBuff.base =>
        s in ownBuff.base && s !== 'sheerForce'
    )
    .map((s) => ownBuff.initial[s].add(ownBuff.base[s], true)),
  // final x += initial X + combat X
  ...nonFlatAndPercentStats
    .filter((s) => s !== 'sheerForce')
    .map((s) => ownBuff.final[s].add(sum(own.initial[s], own.combat[s]), true)),

  // Do proper initial/combat/final sheer force calcs
  // initial sheerForce = initial atk * 0.3
  ownBuff.initial.sheerForce.add(
    cmpEq(own.char.specialty, 'rupture', prod(own.initial.atk, percent(0.3)))
  ),
  // combat sheerForce = (final atk - initial atk) * 0.3
  ownBuff.combat.sheerForce.add(
    cmpEq(
      own.char.specialty,
      'rupture',
      prod(sum(own.final.atk, prod(-1, own.initial.atk)), percent(0.3))
    )
  ),
  // final sheerForce = initial + combat
  ownBuff.final.sheerForce.add(
    sum(own.initial.sheerForce, own.combat.sheerForce)
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  ownBuff.common.cappedCrit_.add(
    max(min(own.final.crit_, percent(1)), percent(0))
  ),
  ownBuff.common.anom_cappedCrit_.add(
    max(min(own.final.anom_crit_, percent(1)), percent(0))
  ),

  // Default conditionals to 0
  reader
    .with('qt', 'cond')
    .add(0),
]
export default data
