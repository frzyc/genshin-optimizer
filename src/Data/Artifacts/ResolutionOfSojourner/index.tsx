import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "ResolutionOfSojourner"

const set2 = greaterEq(input.artSet.ResolutionOfSojourner, 2, percent(0.18))
const set4 = greaterEq(input.artSet.ResolutionOfSojourner, 4, percent(0.3))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    charged_critRate_: set4
  }
})

const sheet: IArtifactSheet = {
  name: "Resolution of Sojourner", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        fields: [{
          node: set4,
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
