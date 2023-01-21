import { max, min, prod } from "@genshin-optimizer/waverider"
import { Data, percent, presets, reader } from "../util"
import dmg from './dmg'

const { self, team } = reader.with('src', 'agg')._withAll('et')
const srcs = reader._withAll('src')

const data: Data = [
  ...dmg,

  // Final <= Premod <= Base
  self.with('qt', 'final').addNode(self.with('qt', 'premod', 'sum')),
  self.with('qt', 'premod').addNode(self.with('qt', 'base', 'sum')),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    self.premod[s].addNode(prod(self.base[s], self.premod[`${s}_`]))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  self.common.cappedCritRate_.addNode(max(min(self.final.critRate_, percent(1)), percent(0))),

  // agg <= char + weapon + art + team + custom
  srcs.agg.reread(srcs.char),
  srcs.agg.reread(srcs.weapon),
  srcs.agg.reread(srcs.art),
  srcs.agg.reread(srcs.custom),

  ...presets.map(dst =>
    // TODO: Upstream possibility that tag value may be null
    reader.withTag({ dst, et: 'target' }).reread(self.withTag({ dst: null as any, et: 'self' }))),
]
export default data
