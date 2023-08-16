import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'GoldenTroupe'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(
  input.artSet.GoldenTroupe,
  2,
  0.2,
  KeyMap.info('skill_dmg_')
)

const set4 = greaterEq(
  input.artSet.GoldenTroupe,
  4,
  0.25,
  KeyMap.info('skill_dmg_')
)
const [condSet4Path, condSet4] = cond(key, 'set4')
const set4Cond = greaterEq(
  input.artSet.GoldenTroupe,
  4,
  equal(condSet4, 'on', 0.25, KeyMap.info('skill_dmg_'))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    skill_dmg_: sum(set2, set4, set4Cond),
  },
})

const sheet: IArtifactSheet = {
  name: 'Golden Troupe',
  rarity: [4, 5],
  setEffects: {
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
        {
          header: setHeader(4),
          path: condSet4Path,
          value: condSet4,
          name: st('charOffField'),
          states: {
            on: {
              fields: [
                {
                  node: set4Cond,
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
