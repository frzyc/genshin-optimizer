import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "TenacityOfTheMillelith"
const setHeader = setHeaderTemplate(key, icons)

const hp_ = greaterEq(input.artSet.TenacityOfTheMillelith, 2, percent(0.2))
const [condPath, condNode] = cond(key, "skill")
const set4Atk = greaterEq(input.artSet.TenacityOfTheMillelith, 4,
  equal("cast", condNode, percent(0.2)))
const set4Shield = greaterEq(input.artSet.TenacityOfTheMillelith, 4,
  equal("cast", condNode, percent(0.3)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hp_,
  },
  teamBuff: {
    premod: {
      atk_: set4Atk,
      shield_: set4Shield
    }
  }
})

const sheet: IArtifactSheet = {
  name: "Tenacity of the Millelith", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: hp_ }] }] },
    4: {
      document: [{
        header: setHeader(4),
        teamBuff: true,
        path: condPath,
        value: condNode,
        name: st("hitOp.skill"),
        states: {
          cast: {
            fields: [{
              node: set4Atk,
            }, {
              node: set4Shield,
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
