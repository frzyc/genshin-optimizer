import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "RetracingBolide"
const setHeader = setHeaderTemplate(key, icons)

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.RetracingBolide, 2, percent(0.35))
const set4NA = greaterEq(input.artSet.RetracingBolide, 4, equal("on", condState, percent(0.4)))
const set4CA = greaterEq(input.artSet.RetracingBolide, 4, equal("on", condState, percent(0.4)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    shield_: set2,
    normal_dmg_: set4NA,
    charged_dmg_: set4CA,
  },
})

const sheet: IArtifactSheet = {
  name: "Retracing Bolide", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: st("protectedByShield"),
        states: {
          on: {
            fields: [{
              node: set4NA,
            }, {
              node: set4CA,
            }]
          },
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
