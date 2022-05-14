import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "HeartOfDepth"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.HeartOfDepth, 2, percent(0.15))
const [condPath, condNode] = cond(key, "skill")
const set4Norm = greaterEq(input.artSet.HeartOfDepth, 4,
  equal("cast", condNode, percent(0.3)))
const set4Charged = { ...set4Norm }

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hydro_dmg_: set2,
    normal_dmg_: set4Norm,
    charged_dmg_: set4Charged,
  },
})

const sheet: IArtifactSheet = {
  name: "Heart of Depth", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condPath,
        value: condNode,
        name: st("afterUse.skill"),
        states: {
          cast: {
            fields: [{
              node: set4Norm,
            }, {
              node: set4Charged,
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
