import icons from './icons'
import { Data } from '../../../Formula/type'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "PrayersForDestiny"

export const data: Data = dataObjForArtifactSheet(key)

const sheet: IArtifactSheet = {
  name: "Prayers for Destiny", rarity: [3, 4],
  icons,
  setEffects: {
    1: {}
  }
}
export default new ArtifactSheet(key, sheet, data)
