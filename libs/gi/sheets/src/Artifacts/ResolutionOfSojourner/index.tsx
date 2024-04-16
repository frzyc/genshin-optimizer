import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'ResolutionOfSojourner'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.ResolutionOfSojourner, 2, percent(0.18))
const set4 = greaterEq(input.artSet.ResolutionOfSojourner, 4, percent(0.3))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    charged_critRate_: set4,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: [
          {
            node: set4,
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
