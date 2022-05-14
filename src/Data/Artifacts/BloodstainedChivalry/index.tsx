import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "BloodstainedChivalry"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.BloodstainedChivalry, 2, percent(0.25))
const [condPath, condNode] = cond(key, "defeat")
const set4Charged = greaterEq(input.artSet.BloodstainedChivalry, 4,
  equal("hit", condNode, percent(0.5)))
const set4StamDec = greaterEq(input.artSet.BloodstainedChivalry, 4,
  equal("hit", condNode, percent(1)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    physical_dmg_: set2,
    charged_dmg_: set4Charged,
    staminaDec_: set4StamDec,
  },
})

const sheet: IArtifactSheet = {
  name: "Bloodstained Chivalry", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condPath,
        value: condNode,
        name: st("afterDefeatEnemy", { percent: 70 }),
        states: {
          hit: {
            fields: [{
              node: set4Charged
            }, {
              node: set4StamDec
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
