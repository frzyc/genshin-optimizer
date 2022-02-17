import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, equal } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, trans } from '../../SheetUtil'

const key: ArtifactSetKey = "ShimenawasReminiscence"

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
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
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
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
