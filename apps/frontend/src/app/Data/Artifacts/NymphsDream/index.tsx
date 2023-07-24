import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  constant,
  greaterEq,
  lookup,
  naught,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { cond, st, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'NymphsDream'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(
  input.artSet.NymphsDream,
  2,
  0.15,
  KeyMap.info('hydro_dmg_')
)

const [condSet4Path, condSet4] = cond(key, 'set4')
const stacksArr = range(1, 3)
const atk_arr = [0.07, 0.16, 0.25]
const hydro_dmg_arr = [0.04, 0.09, 0.15]
const set4_atk_ = greaterEq(
  input.artSet.NymphsDream,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(atk_arr[stack - 1])),
    naught
  )
)
const set4_hydro_dmg_ = greaterEq(
  input.artSet.NymphsDream,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(hydro_dmg_arr[stack - 1])),
    naught
  ),
  KeyMap.info('hydro_dmg_')
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hydro_dmg_: sum(set2, set4_hydro_dmg_),
    atk_: set4_atk_,
  },
})

const sheet: IArtifactSheet = {
  name: "Nymph's Dream",
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
          name: trm('condName'),
          states: objKeyMap(stacksArr, (stack) => ({
            name: st('stack', { count: stack }),
            fields: [
              {
                node: set4_atk_,
              },
              {
                node: set4_hydro_dmg_,
              },
              {
                text: stg('duration'),
                value: 8,
                unit: 's',
              },
            ],
          })),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
