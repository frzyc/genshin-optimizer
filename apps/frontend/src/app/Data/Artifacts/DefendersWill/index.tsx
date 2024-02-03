import { objKeyValMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { input, tally } from '../../../Formula/index'
import type { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'DefendersWill'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.DefendersWill, 2, percent(0.3))

const res_ = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_res_`,
  greaterEq(
    input.artSet.DefendersWill,
    4,
    greaterEq(tally[ele], 1, percent(0.3))
  ),
])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: set2,
    ...res_,
  },
})

const sheet: IArtifactSheet = {
  name: "Defender's Will",
  rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          fields: Object.values(res_).map((node) => ({ node })),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
