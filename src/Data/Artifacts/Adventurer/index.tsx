import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "Adventurer"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.Adventurer, 2, 1000)
const heal = greaterEq(input.artSet.Adventurer, 4,
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
