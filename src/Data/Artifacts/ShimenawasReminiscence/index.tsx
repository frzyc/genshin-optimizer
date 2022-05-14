import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "ShimenawasReminiscence"
const setHeader = setHeaderTemplate(key, icons)
const [, trm] = trans("artifact", key)

const [usedEnergyStatePath, usedEnergyState] = cond(key, "usedEnergy")

const set2 = greaterEq(input.artSet.ShimenawasReminiscence, 2, percent(0.18))
const set4Norm = greaterEq(input.artSet.ShimenawasReminiscence, 4,
  equal("used", usedEnergyState, percent(0.5)))
const set4Charged = { ...set4Norm }
const set4Plunge = { ...set4Norm }

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmg_: set4Norm,
    charged_dmg_: set4Charged,
    plunging_dmg_: set4Plunge
  }
})

const sheet: IArtifactSheet = {
  name: "Shimenawa's Reminiscence", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: usedEnergyState,
        path: usedEnergyStatePath,
        name: trm("afterUseEnergy"),
        states: {
          used: {
            fields: [{
              node: set4Norm,
            }, {
              node: set4Charged,
            }, {
              node: set4Plunge,
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
