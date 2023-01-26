import { max, min, subscript, sum } from '@genshin-optimizer/waverider'
import { Data, elements, reader } from '../util'
import charCurves from './expCurve.gen.json'
import Nahida from './Nahida'
import Nilou from './Nilou'

const data: Data = [
  ...Nahida,
  ...Nilou,

  // Char curves
  ...Object.entries(charCurves).map(([k, v]) => reader.custom[k].addNode(subscript(reader.char.lvl, v))),
]
export default data
