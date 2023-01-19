import { max, min, prod } from "@genshin-optimizer/waverider"
import { Data, naught, one, reader } from "../util"
import dmg from './dmg'

const nosrc = reader.src('none', 'sum')

const data: Data = [
  ...dmg,

  // Final <= Premod <= Base
  nosrc.with('stage', 'final').addNode(reader.with('stage', 'premod', 'sum')),
  nosrc.with('stage', 'premod').addNode(reader.with('stage', 'base', 'sum')),

  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    nosrc.premod[s].addNode(prod(reader.base[s], reader.premod[`${s}_`]))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  nosrc.q.cappedCritRate_.addNode(max(min(reader.final.critRate_, one), naught)),

  nosrc.reread(reader.src('char')),
  nosrc.reread(reader.src('weapon')),
  nosrc.reread(reader.src('art')),
  nosrc.reread(reader.src('team')),
  nosrc.reread(reader.src('custom')),
]
export default data
