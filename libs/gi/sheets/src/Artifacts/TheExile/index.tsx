import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'TheExile'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.TheExile, 2, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2,
  },
})

const sheet: IArtifactSheet = {
  name: 'The Exile',
  rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: { document: [{ header: setHeader(4), fields: [] }] },
  },
}
export default new ArtifactSheet(key, sheet, data)
