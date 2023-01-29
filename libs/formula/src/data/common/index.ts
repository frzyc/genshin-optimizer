import { max, min, prod, subscript } from '@genshin-optimizer/waverider'
import { custom, Data, dsts, percent, reader, self, selfBuff } from '../util'
import dmg from './dmg'
import prep from './prep'
import { ampData } from './reaction'
import team from './team'

import charCurves from '../char/expCurve.gen.json'
import weaponCurves from '../weapon/expCurve.gen.json'

const data: Data = [
  ...dmg, ...prep, ...team, ...ampData,

  reader.withTag({ at: 'agg', et: 'self' }).reread(reader.withTag({ at: 'comp', src: 'art' })),
  reader.withTag({ at: 'agg', et: 'self' }).reread(reader.withTag({ at: 'comp', src: 'reaction' })),

  // Final <= Premod <= Base
  reader.withTag({ at: 'agg', et: 'self', qt: 'final' }).add(reader.with('qt', 'premod').sum),
  reader.withTag({ at: 'agg', et: 'self', qt: 'premod' }).add(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    selfBuff.premod[s].with('at', 'agg').add(prod(self.base[s], self.premod[`${s}_`]))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  selfBuff.common.cappedCritRate_.with('at', 'iso').add(max(min(self.final.critRate_, percent(1)), percent(0))),

  // Default all elemental `common.count`s to zero
  selfBuff.common.count.add(0),

  // target.* turns into self.* under `preset:dst`
  ...dsts.map(dst =>
    reader.withTag({ dst, et: 'target' }).reread(reader.withTag({ preset: dst, dst: null, et: 'self' }))),

  // Char & weapon curves
  ...Object.entries(charCurves).map(([k, v]) => custom[k].add(subscript(self.char.lvl, v))),
  ...Object.entries(weaponCurves).map(([k, v]) => custom[k].add(subscript(self.weapon.lvl, v))),
]
export default data
