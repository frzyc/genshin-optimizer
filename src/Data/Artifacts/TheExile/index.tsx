import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "TheExile"

const set2 = greaterEq(input.artSet.TheExile, 2, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2
  }
})

const sheet: IArtifactSheet = {
  name: "The Exile", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: { document: []}
  }
}
export default new ArtifactSheet(key, sheet, data)
