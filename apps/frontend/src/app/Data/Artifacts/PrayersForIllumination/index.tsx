import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'

import type { Data } from '../../../Formula/type'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'PrayersForIllumination'
const setHeader = setHeaderTemplate(key)

export const data: Data = dataObjForArtifactSheet(key)

const sheet: IArtifactSheet = {
  name: 'Prayers for Illumination',
  rarity: [3, 4],
  setEffects: {
    1: { document: [{ header: setHeader(1), fields: [] }] },
  },
}
export default new ArtifactSheet(key, sheet, data)
