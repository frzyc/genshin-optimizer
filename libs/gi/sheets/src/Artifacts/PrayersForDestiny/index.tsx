import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'PrayersForDestiny'
const setHeader = setHeaderTemplate(key)

export const data: Data = dataObjForArtifactSheet(key)

const sheet: SetEffectSheet = {
  1: { document: [{ header: setHeader(1), fields: [] }] },
}
export default new ArtifactSheet(sheet, data)
