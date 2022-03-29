import icons from './icons'
import { Data } from '../../../Formula/type'
import { infoMut, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = "LuckyDog"
const set2 = greaterEq(input.artSet.LuckyDog, 2, 100)
const heal = greaterEq(input.artSet.LuckyDog, 4, 300)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def: set2
  },
}, {
  heal,
})

const sheet: IArtifactSheet = {
  name: "Lucky Dog", rarity: [3],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
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
