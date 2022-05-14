import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "ResolutionOfSojourner"
const setHeader = setHeaderTemplate(key, icons)

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
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{
          node: set4,
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
