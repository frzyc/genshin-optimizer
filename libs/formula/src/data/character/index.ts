import { max, min, subscript, sum } from "@genshin-optimizer/waverider"
import { Data, elements, reader, team } from "../util"
import charCurves from './expCurve.gen.json'
import Nahida from './Nahida'
import Nilou from './Nilou'

const data: Data = [
  ...Nahida,
  ...Nilou,

  // Char curves
  ...Object.entries(charCurves).map(([k, v]) =>
    reader.custom[k].addNode(subscript(reader.q.lvl, v))),

  team.q.eleCount.addNode(sum(
    ...elements.map(ele => min(team[ele].q.count, 1))
  ))
]
export default data
