import { input } from '../../../Formula'
import { Data, Info } from '../../../Formula/type'
import { equal, greaterEq, percent, sum } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "Berserker"
const setHeader = setHeaderTemplate(key, icons)

const critRate_info: Info = { key: "critRate_" }
const set2 = greaterEq(input.artSet.Berserker, 2, percent(0.12), critRate_info)
const [condPath, condNode] = cond(key, "hp")
const set4 = greaterEq(input.artSet.Berserker, 4,
  equal("70", condNode, percent(0.24)), critRate_info)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    critRate_: sum(set2, set4),
  },
})

const sheet: IArtifactSheet = {
  name: "Berserker", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condPath,
        value: condNode,
        teamBuff: true,
        name: st("lessPercentHP", { percent: 70 }),
        states: {
          70: {
            fields: [{
              node: set4,
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
