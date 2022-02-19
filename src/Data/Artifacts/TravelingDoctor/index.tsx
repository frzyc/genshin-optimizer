import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, prod, infoMut } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, sgt, st } from '../../SheetUtil'
const key: ArtifactSetKey = "TravelingDoctor"

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.TravelingDoctor, 2, percent(0.2))
const heal = greaterEq(input.artSet.TravelingDoctor, 4,
  prod(percent(0.2), input.total.hp))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    incHeal_: set2,
  }
}, {
  heal,
})

const sheet: IArtifactSheet = {
  name: "Traveling Doctor", rarity: [3],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          value: condState,
          path: condStatePath,
          name: st("afterUse.burst"),
          states: {
            on: {
              fields: [{
                node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" })
              }]
            }
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
