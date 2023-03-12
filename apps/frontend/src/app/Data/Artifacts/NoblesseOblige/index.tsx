import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'NoblesseOblige'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.NoblesseOblige, 2, percent(0.2))

const [condSet4Path, condSet4] = cond(key, 'set4')
const set4 = greaterEq(
  input.artSet.NoblesseOblige,
  4,
  equal(condSet4, 'on', percent(0.2))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    burst_dmg_: set2,
  },
  teamBuff: {
    premod: {
      atk_: set4,
    },
  },
})

const sheet: IArtifactSheet = {
  name: 'Noblesse Oblige',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          teamBuff: true,
          value: condSet4,
          path: condSet4Path,
          name: st('afterUse.burst'),
          states: {
            on: {
              fields: [
                {
                  node: set4,
                },
                {
                  text: stg('duration'),
                  value: 12,
                  unit: 's',
                },
              ],
            },
          },
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
