import { max, min, prod, subscript } from '@genshin-optimizer/waverider'
import { Data, dsts, percent, reader, self } from '../util'
import dmg from './dmg'
import team from './team'
import { ampData } from './reaction'

import charCurves from '../char/expCurve.gen.json'
import weaponCurves from '../weapon/expCurve.gen.json'

const data: Data = [
  ...dmg, ...team, ...ampData,

  // Final <= Premod <= Base
  reader.withTag({ et: 'self', src: 'agg' }).with('qt', 'final').addNode(reader.with('qt', 'premod').sum),
  reader.withTag({ et: 'self', src: 'agg' }).with('qt', 'premod').addNode(reader.with('qt', 'base').sum),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    self.premod[s].addNode(prod(self.base[s], self.premod[`${s}_`]))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  self.common.cappedCritRate_.addNode(max(min(self.final.critRate_, percent(1)), percent(0))),

  // Default all `common.count`s to zero
  self.common.count.addNode(0),

  // target.* turns into self.* under `preset:dst`
  ...dsts.map(dst =>
    reader.withTag({ dst, et: 'target' }).reread(reader.withTag({ preset: dst, dst: null, et: 'self' }))),

  // Char & weapon curves
  ...Object.entries(charCurves).map(([k, v]) => self.custom[k].addNode(subscript(self.char.lvl, v))),
  ...Object.entries(weaponCurves).map(([k, v]) => self.custom[k].addNode(subscript(self.weapon.lvl, v))),
]
export default data
