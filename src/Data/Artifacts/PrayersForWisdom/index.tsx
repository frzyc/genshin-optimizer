import { Data } from '../../../Formula/type'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "PrayersForWisdom"
const setHeader = setHeaderTemplate(key, icons)

export const data: Data = dataObjForArtifactSheet(key)

const sheet: IArtifactSheet = {
  name: "Prayers for Wisdom", rarity: [3, 4],
  icons,
  setEffects: {
    1: { document: [{ header: setHeader(1), fields: [] }] }
  }
}
export default new ArtifactSheet(key, sheet, data)
