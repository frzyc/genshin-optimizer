import icons from './icons'
import { Data } from '../../../Formula/type'
import { data as dataUtil, constant, percent, prod, threshold_add, infoMut } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { mergeData } from '../../../Formula/api'
const key: ArtifactSetKey = "OceanHuedClam"
const set2 = threshold_add(input.artSet.OceanHuedClam, 2, 1000)
const heal = threshold_add(input.artSet.OceanHuedClam, 4,
  dataUtil(input.hit.dmg, mergeData([{
    hit: {
      base: prod(percent(0.9), constant(30000)),
      move: constant("elemental"),
      ele: constant("physical")
    }
  }]))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    heal_: set2
  },
}, {
  heal,
})

const sheet: IArtifactSheet = {
  name: "Ocean-Hued Clam", rarity: [4, 5],
  icons,
  setEffects: {
    2: {
      document: [{ fields: [{ node: set2 }] }]
    },
    4: {
      document: [{
        fields: [{
          node: infoMut(heal, { key: `${key}:condName`, variant: "physical" })
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
