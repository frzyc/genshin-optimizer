import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "TravelingDoctor"
const setHeader = setHeaderTemplate(key, icons)

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
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: st("afterUse.burst"),
        states: {
          on: {
            fields: [{
              node: infoMut(heal, { key: "sheet_gen:healing", variant: "heal" })
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
