import { Data } from '../../../Formula/type'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "PrayersForDestiny"
const setHeader = setHeaderTemplate(key)

export const data: Data = dataObjForArtifactSheet(key)

const sheet: IArtifactSheet = {
  name: "Prayers for Destiny", rarity: [3, 4],
  setEffects: {
    1: { document: [{ header: setHeader(1), fields: [] }] }
  }
}
export default new ArtifactSheet(key, sheet, data)
