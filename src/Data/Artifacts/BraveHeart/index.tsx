import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, percent, greaterEq } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "BraveHeart"
const [, trm] = trans("artifact", key)
const set2 = greaterEq(input.artSet.BraveHeart, 2, percent(0.18))
const [condPath, condNode] = cond(key, "hp")
const set4 = greaterEq(input.artSet.BraveHeart, 4,
  equal("50", condNode, percent(0.3))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    all_dmg_: set4,
  },
}, undefined)

const sheet: IArtifactSheet = {
  name: "Brave Heart", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          path: condPath,
          value: condNode,
          name: trm("condName"),
          states: {
            50: {
              fields: [{
                node: set4,
              }]
            }
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
