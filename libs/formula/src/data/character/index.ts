import { cmpGE, max, min, prod, subscript, sum, sumfrac } from "@genshin-optimizer/waverider"
import { cappedCritRate_, Data, naught, one, percent, reader, todo } from "../util"
import charCurves from "./expCurve_gen.json"
import Nahida from './Nahida'
import reaction from './reaction'

const data: Data = [
  ...reaction,
  ...Nahida,
]

const { base, premod, final } = reader

const preRes = todo
const res = cmpGE(preRes, percent(0.75),
  sumfrac(1, prod(4, preRes)),
  cmpGE(preRes, 0,
    sum(1, prod(-1, preRes)),
    sum(1, prod(-0.5, preRes))
  )
)

data.push(
  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    premod[s].src('none').addNode(prod(base[s], premod[`${s}_`]))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  cappedCritRate_.addNode(max(min(final.critRate_, one), naught)),

  // Char curves
  ...Object.entries(charCurves).map(([k, v]) => // TODO: Update `charCurve` file format
    reader.custom[k].addNode(subscript(reader.q.lvl, [NaN, ...Object.values(v)]))),
)
export default data
