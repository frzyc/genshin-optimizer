import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "BraveHeart"
const setHeader = setHeaderTemplate(key, icons)

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
})

const sheet: IArtifactSheet = {
  name: "Brave Heart", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condPath,
        value: condNode,
        name: st("enemyGreaterPercentHP", { percent: 50 }),
        states: {
          50: {
            fields: [{
              node: set4,
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
