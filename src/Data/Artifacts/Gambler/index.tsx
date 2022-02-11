import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { percent, threshold_add } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "Gambler"

const set2 = threshold_add(input.artSet.Gambler, 2, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    skill_dmg_: set2
  }
})

const sheet: IArtifactSheet = {
  name: "Gambler", rarity: [3, 4],
  icons,
  setEffects: {
    2: {
      document: [{
        fields: [{
          node: set2
        }]
      }]
    },
    4: {}
  }
}
export default new ArtifactSheet(key, sheet, data)
