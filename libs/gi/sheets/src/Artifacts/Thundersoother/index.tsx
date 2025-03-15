import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Thundersoother'
const setHeader = setHeaderTemplate(key)

const [condStatePath, condState] = cond(key, 'state')

const set2 = greaterEq(input.artSet.Thundersoother, 2, percent(0.4))
const set4 = greaterEq(
  input.artSet.Thundersoother,
  4,
  equal('on', condState, percent(0.35)),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    electro_res_: set2,
    all_dmg_: set4,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: st('enemyAffected.electro'),
        states: {
          on: {
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
