import { objKeyValMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { greaterEq, input, percent, tally } from '@genshin-optimizer/gi/wr'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'DefendersWill'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.DefendersWill, 2, percent(0.3))

const res_ = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_res_`,
  greaterEq(
    input.artSet.DefendersWill,
    4,
    greaterEq(tally[ele], 1, percent(0.3)),
  ),
])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: set2,
    ...res_,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: Object.values(res_).map((node) => ({ node })),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
