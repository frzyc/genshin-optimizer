import { input } from '../../../Formula'
import { Data, Info } from '../../../Formula/type'
import { equal, greaterEq, lookup, naught, percent, sum } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "PaleFlame"
const setHeader = setHeaderTemplate(key, icons)

const [condStackPath, condStack] = cond(key, "stacks")

const physical_dmg_info: Info = { key: "physical_dmg_" }
const set2 = greaterEq(input.artSet.PaleFlame, 2, percent(0.25), physical_dmg_info)

const stackArr = range(1, 2)
const set4Atk = greaterEq(input.artSet.PaleFlame, 4,
  lookup(condStack,
    Object.fromEntries(stackArr.map(i => [i, percent(0.09 * i)]))
    , naught))
const set4Phys = greaterEq(input.artSet.PaleFlame, 4,
  lookup(condStack,
    Object.fromEntries(stackArr.map(i => [i, equal(i, 2, percent(0.25))]))
    , naught),
  physical_dmg_info)
export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    physical_dmg_: sum(set2, set4Phys),
    atk_: set4Atk
  }
})

const sheet: IArtifactSheet = {
  name: "Pale Flame", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condStack,
        path: condStackPath,
        teamBuff: true,
        name: st("hitOp.skill"),
        states: Object.fromEntries(stackArr.map(i => [i, {
          name: i.toString(),
          fields: [{ node: set4Atk }, {
            node: set4Phys
          }, {
            text: sgt("duration"),
            value: 7,
            unit: "s"
          }]
        }]))
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
