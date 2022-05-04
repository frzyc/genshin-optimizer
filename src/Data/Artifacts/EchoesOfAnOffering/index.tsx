import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent, prod } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "EchoesOfAnOffering"
const setHeader = setHeaderTemplate(key, icons)
const [, trm] = trans("artifact", key)

const set2 = greaterEq(input.artSet.EchoesOfAnOffering, 2, percent(0.18))
const [condModePath, condMode] = cond(key, "mode")
const normal_dmgInc = greaterEq(input.artSet.EchoesOfAnOffering, 4,
  prod(
    lookup(condMode, {
      "on": percent(0.70),
      "avg": percent(0.70 * 0.50204)
    }, naught),
    input.total.atk
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmgInc
  }
})
const sheet: IArtifactSheet = {
  name: "Echoes of an Offering", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condMode,
        path: condModePath,
        name: trm("mode"),
        states: {
          on: {
            name: trm("always"),
            fields: [{ node: normal_dmgInc }]
          },
          avg: {
            name: trm("avg"),
            fields: [{ node: normal_dmgInc }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
