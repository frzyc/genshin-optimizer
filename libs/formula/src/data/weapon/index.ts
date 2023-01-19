import { subscript } from "@genshin-optimizer/waverider"
import { Data, reader } from "../util"
import weaponCurves from './expCurve.gen.json'

import KeyOfKhajNisut from './KeyOfKhajNisut'
import TulaytullahsRemembrance from './TulaytullahsRemembrance'

const data: Data = [
  ...KeyOfKhajNisut,
  ...TulaytullahsRemembrance,

  // Weapon curves
  ...Object.entries(weaponCurves).map(([k, v]) =>
    reader.custom[k].addNode(subscript(reader.q.lvl, v))),
]
export default data
