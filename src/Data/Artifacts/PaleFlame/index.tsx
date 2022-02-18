import icons from './icons'
import { Data } from '../../../Formula/type'
import { lookup, naught, percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, sgt, st } from '../../SheetUtil'

const key: ArtifactSetKey = "PaleFlame"

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.PaleFlame, 2, lookup(condState, { "twostacks": percent(0.5) }, percent(0.25)))
const set4 = greaterEq(input.artSet.PaleFlame, 4, lookup(condState, { "onestack": percent(0.09), "twostacks": percent(0.18) }, naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    physical_dmg_: set2,
    atk_: set4
  }
})

const sheet: IArtifactSheet = {
  name: "Pale Flame", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          value: condState,
          path: condStatePath,
          name: st("hitOp.skill"),
          states: {
            onestack: {
              name: st("stack", { count: 1 }),
              fields: [{ node: set4 }, { text: sgt("duration"), value: 7, unit: 's' }]
            },
            twostacks: {
              name: st("stack", { count: 2 }),
              fields: [{ node: set4 }, { text: sgt("duration"), value: 7, unit: 's' }]
            }
          }
        }
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
