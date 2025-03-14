import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  constant,
  greaterEq,
  input,
  lookup,
  naught,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'NymphsDream'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.NymphsDream, 2, 0.15, {
  path: 'hydro_dmg_',
})

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
    naught,
  ),
)
const set4_hydro_dmg_ = greaterEq(
  input.artSet.NymphsDream,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(hydro_dmg_arr[stack - 1])),
    naught,
  ),
  { path: 'hydro_dmg_' },
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hydro_dmg_: sum(set2, set4_hydro_dmg_),
    atk_: set4_atk_,
  },
})

const sheet: SetEffectSheet = {
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
}
export default new ArtifactSheet(sheet, data)
