import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, infoMut } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "LuckyDog"
const setHeader = setHeaderTemplate(key, icons)

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
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: [{
          node: infoMut(heal, { key: "sheet_gen:healing", variant: "heal" })
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
