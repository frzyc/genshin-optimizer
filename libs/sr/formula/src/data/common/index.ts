import { max, min, prod } from '@genshin-optimizer/pando/engine'
import { allLightConeKeys } from '@genshin-optimizer/sr/consts'
import type { TagMapNodeEntries } from '../util'
import { own, ownBuff, percent, reader } from '../util'
import dmg from './dmg'
import prep from './prep'

const data: TagMapNodeEntries = [
  ...dmg,
  ...prep,

  reader.withTag({ sheet: 'iso', et: 'own' }).reread(reader.sheet('custom')),
  reader.withTag({ sheet: 'agg', et: 'own' }).reread(reader.sheet('custom')),

  // convert sheet:<char/lightCone> to sheet:agg for accumulation
  // sheet:<relic> is reread in src/util.ts:relicTagMapNodeEntries()
  reader.sheet('agg').reread(reader.sheet('char')),

  // add all light cones by default
  ...allLightConeKeys.map((lc) =>
    reader.sheet('lightCone').reread(reader.sheet(lc))
  ),
  reader.sheet('agg').reread(reader.sheet('lightCone')),

  // Final <= Premod <= Base
  reader
    .withTag({ sheet: 'agg', et: 'own', qt: 'final' })
    .add(reader.with('qt', 'premod').sum),
  reader
    .withTag({ sheet: 'agg', et: 'own', qt: 'premod' })
    .add(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp', 'spd'] as const).map((s) =>
    ownBuff.premod[s].add(prod(own.base[s], own.premod[`${s}_`]))
  ),

  // Capped CR = Max(Min(Final CR, 1), 0)
  ownBuff.common.cappedCrit_.add(
    max(min(own.final.crit_, percent(1)), percent(0))
  ),

  // Default conditionals to 0
  reader.with('qt', 'cond').add(0),

  // Default superimposition to 1
  reader.withTag(own.lightCone.superimpose.tag).add(1),
]
export default data
