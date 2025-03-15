import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'BraveHeart'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.BraveHeart, 2, percent(0.18))
const [condPath, condNode] = cond(key, 'hp')
const set4 = greaterEq(
  input.artSet.BraveHeart,
  4,
  equal('50', condNode, percent(0.3)),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    all_dmg_: set4,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        path: condPath,
        value: condNode,
        name: st('enemyGreaterPercentHP', { percent: 50 }),
        states: {
          50: {
            fields: [
              {
                node: set4,
              },
            ],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
