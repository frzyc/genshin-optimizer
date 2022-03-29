import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'
const key: ArtifactSetKey = "ThunderingFury"

const set2 = greaterEq(input.artSet.ThunderingFury, 2, percent(0.15))
const set4 = greaterEq(input.artSet.ThunderingFury, 4, percent(0.40))

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
