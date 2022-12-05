import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, stg, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "DesertPavilionChronicle"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.DesertPavilionChronicle, 2, 0.15)

const [condSet4Path, condSet4] = cond(key, "set4")
const atkSPD_ = greaterEq(input.artSet.DesertPavilionChronicle, 4, equal(condSet4, "on", percent(0.1)))
const normal_dmg_ = greaterEq(input.artSet.DesertPavilionChronicle, 4, equal(condSet4, "on", percent(0.4)))
const charged_dmg_ = { ...normal_dmg_ }
const plunging_dmg_ = { ...normal_dmg_ }

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    anemo_dmg_: set2,
    atkSPD_,
    normal_dmg_,
    charged_dmg_,
    plunging_dmg_,
  },
})

const sheet: IArtifactSheet = {
  name: "Desert Pavilion Chronicle", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condSet4Path,
        value: condSet4,
        teamBuff: true,
        name: st("hitOp.charged"),
        states: {
          on: {
            fields: [{
              node: atkSPD_,
            }, {
              node: normal_dmg_,
            }, {
              node: charged_dmg_,
            }, {
              node: plunging_dmg_,
            }, {
              text: stg("duration"),
              value: 10,
              unit: "s"
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
