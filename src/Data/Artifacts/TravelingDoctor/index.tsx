import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, prod } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, sgt, st } from '../../SheetUtil'
const key: ArtifactSetKey = "TravelingDoctor"

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.TravelingDoctor, 2, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    incHeal_: set2,
  }
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
                text: sgt("healing"),
                value: (data) => {
                  return (data.get(input.total.hp).value) * 0.2
                },
                unit: " HP"
              }]
            }
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
