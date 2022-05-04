import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "MaidenBeloved"
const setHeader = setHeaderTemplate(key, icons)

const [condStatePath, condState] = cond(key, "state")
const set2 = greaterEq(input.artSet.MaidenBeloved, 2, percent(0.15))
const set4 = greaterEq(input.artSet.MaidenBeloved, 4, equal("on", condState, percent(0.2)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    heal_: set2,
  },
  teamBuff: {
    premod: {
      incHeal_: set4
    }
  }
})

const sheet: IArtifactSheet = {
  name: "Maiden Beloved", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        teamBuff: true,
        value: condState,
        path: condStatePath,
        name: st("afterUse.skillOrBurst"),
        states: {
          on: {
            fields: [{
              node: set4,
            }]
          },
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
