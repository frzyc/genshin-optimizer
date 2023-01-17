import { AnyNode, max, min, prod, RawTagMapEntries, subscript } from "@genshin-optimizer/waverider"
import { base, cappedCritRate_, final, naught, one, premod, reader } from "../util"
import dmg from './dmg'
import charCurves from "./expCurve_gen.json"
import Nahida from './Nahida'
import reaction from './reaction'

const data: RawTagMapEntries<AnyNode> = [
  ...Nahida,
]

data.push(
  // premod X += base X * premod X%
  ...(['atk', 'def', 'hp'] as const).map(s =>
    premod.q(s).addNode(prod(base.q(s), premod.q(`${s}_`)))),

  // Capped CR = Max(Min(Final CR, 1), 0)
  cappedCritRate_.addNode(max(min(final.q('critRate_'), one), naught)),

  // Char curves
  ...Object.entries(charCurves).map(([k, v]) => // TODO: Update `charCurve` file format
    reader.customQ[k].addNode(subscript(reader.q('lvl'), [NaN, ...Object.values(v)]))),

  ...reaction, ...dmg,
)
export default data
