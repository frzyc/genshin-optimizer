import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { max, min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { allStatics, own, ownBuff, percent, reader, team } from '../util'
import dmg from './dmg'
import prep from './prep'
import reaction from './reaction'
import resonance from './resonance'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,
  ...reaction,
  ...resonance,

  reader.withTag({ sheet: 'iso', et: 'own' }).reread(reader.sheet('custom')),
  reader.withTag({ sheet: 'agg', et: 'own' }).reread(reader.sheet('custom')),

  // Final <= Premod <= Base + WeaponRefinement
  reader
    .withTag({ sheet: 'agg', et: 'own', qt: 'final' })
    .add(reader.with('qt', 'premod')),
  reader
    .withTag({ sheet: 'agg', et: 'own', qt: 'premod' })
    .add(reader.with('qt', 'base').sum), // add `accu` because these aren't in `ownTag`
  reader
    .withTag({ sheet: 'agg', et: 'own', qt: 'premod' })
    .add(reader.with('qt', 'weaponRefinement')),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map((s) =>
    ownBuff.premod[s].add(prod(own.base[s], own.premod[`${s}_`])),
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  ownBuff.common.cappedCritRate_.add(
    max(min(own.final.critRate_, percent(1)), percent(0)),
  ),
  ownBuff.trans.cappedCritRate_.add(
    max(min(own.trans.critRate_, percent(1)), percent(0)),
  ),

  // Char & weapon curves
  ...Object.entries(allStats.char.expCurve).map(([k, v]) =>
    allStatics('static')[k].add(subscript(own.char.lvl, v)),
  ),
  ...Object.entries(allStats.weapon.expCurve).map(([k, v]) =>
    allStatics('static')[k].add(subscript(own.weapon.lvl, v)),
  ),

  // Total element count; this is NOT a `team` stat
  ownBuff.common.eleCount.add(
    sum(...allElementKeys.map((ele) => team.common.count[ele].max)),
  ),

  // Default conditionals to 0
  reader.with('qt', 'cond').add(0),
]
export default data
