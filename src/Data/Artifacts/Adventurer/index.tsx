import icons from './icons'
import { Data } from '../../../Formula/type'
import { infoMut, percent, prod, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = "Adventurer"
const set2 = threshold_add(input.artSet.Adventurer, 2, 1000)
const heal = threshold_add(input.artSet.Adventurer, 4,
  prod(percent(0.3), input.total.hp))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hp: set2
  },
}, {
  heal,
})

const sheet: IArtifactSheet = {
  name: "Adventurer", rarity: [3],
  icons,
  setEffects: {
    2: {
      document: [{
        fields: [{
          node: set2,
        }]
      }]
    },
    4: {
      document: [{
        fields: [{
          node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" })
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
