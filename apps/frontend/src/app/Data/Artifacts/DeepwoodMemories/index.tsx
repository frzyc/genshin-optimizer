import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'DeepwoodMemories'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.DeepwoodMemories, 2, 0.15)

const [condSet4Path, condSet4] = cond(key, 'set4')
const set4 = greaterEq(
  input.artSet.DeepwoodMemories,
  4,
  equal(condSet4, 'on', -0.3)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    dendro_dmg_: set2,
  },
  teamBuff: {
    premod: {
      dendro_enemyRes_: set4,
    },
  },
})

const sheet: IArtifactSheet = {
  name: 'Deepwood memories',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          path: condSet4Path,
          value: condSet4,
          teamBuff: true,
          name: st('hitOp.skillOrBurst'),
          states: {
            on: {
              fields: [
                {
                  node: set4,
                },
                {
                  text: stg('duration'),
                  value: 8,
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
