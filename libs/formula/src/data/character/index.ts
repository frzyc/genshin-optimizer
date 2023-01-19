import { subscript } from "@genshin-optimizer/waverider"
import { Data, reader } from "../util"
import charCurves from './expCurve.gen.json'
import Nahida from './Nahida'

const data: Data = [
  ...Nahida,

  // Char curves
  ...Object.entries(charCurves).map(([k, v]) =>
    reader.custom[k].addNode(subscript(reader.q.lvl, v))),
]
export default data
