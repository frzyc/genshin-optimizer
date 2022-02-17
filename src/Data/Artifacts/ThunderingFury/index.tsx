import icons from './icons'
import { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent, threshold_add } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = "ThunderingFury"

const set2 = greaterEq(input.artSet.ThunderingFury, 2, percent(0.15), 0)
const set4 = greaterEq(input.artSet.ThunderingFury, 4, percent(0.40), 0)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    electro_dmg_: set2,
    overloaded_dmg_: set4,
    electrocharged_dmg_: set4,
    superconduct_dmg_: set4
  },
})

const sheet: IArtifactSheet = {
  name: "Thundering Fury", rarity: [4, 5],
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