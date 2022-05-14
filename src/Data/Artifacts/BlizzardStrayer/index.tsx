import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "BlizzardStrayer"
const setHeader = setHeaderTemplate(key, icons)
const [, trm] = trans("artifact", key)

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.BlizzardStrayer, 2, percent(0.15))
const set4 = greaterEq(input.artSet.BlizzardStrayer, 4, lookup(condState, { "cryo": percent(0.20), "frozen": percent(0.40) }, naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    cryo_dmg_: set2,
  },
  total: {
    // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
    critRate_: set4
  }
})

const sheet: IArtifactSheet = {
  name: "Blizzard Strayer", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: trm("condName"),
        states: {
          cryo: {
            name: trm("condCryo"),
            fields: [{ node: set4 }]
          },
          frozen: {
            name: trm("condFrozen"),
            fields: [{ node: set4 }]
          }
        }
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
