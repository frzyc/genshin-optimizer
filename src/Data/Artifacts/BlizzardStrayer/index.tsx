import icons from './icons'
import { Data } from '../../../Formula/type'
import { lookup, naught, percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, trans } from '../../SheetUtil'

const key: ArtifactSetKey = "BlizzardStrayer"

const [, trm] = trans("artifact", key)

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.BlizzardStrayer, 2, percent(0.15))
const set4 = greaterEq(input.artSet.BlizzardStrayer, 4, lookup(condState, { "cryo": percent(0.20), "frozen": percent(0.40) }, naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    cryo_dmg_: set2,
    critRate_: set4
  }
})

const sheet: IArtifactSheet = {//Icebreaker
  name: "Blizzard Strayer", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
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
        }
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
