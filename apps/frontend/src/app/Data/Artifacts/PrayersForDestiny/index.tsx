import type { Data } from '../../../Formula/type'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'PrayersForDestiny'
const setHeader = setHeaderTemplate(key)

export const data: Data = dataObjForArtifactSheet(key)

const sheet: IArtifactSheet = {
  name: 'Prayers for Destiny',
  rarity: [3, 4],
  setEffects: {
    1: { document: [{ header: setHeader(1), fields: [] }] },
  },
}
export default new ArtifactSheet(key, sheet, data)
