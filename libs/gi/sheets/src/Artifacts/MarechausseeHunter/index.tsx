import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  constant,
  greaterEq,
  input,
  lookup,
  naught,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'MarechausseeHunter'
const setHeader = setHeaderTemplate(key)

const set2_normal_dmg_ = greaterEq(input.artSet.MarechausseeHunter, 2, 0.15)
const set2_charged_dmg_ = { ...set2_normal_dmg_ }

const [condSet4Path, condSet4] = cond(key, 'set4')
const stacksArr = range(1, 3)
const set4_critRate_ = greaterEq(
  input.artSet.MarechausseeHunter,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(stack * 0.12)),
    naught,
  ),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    normal_dmg_: set2_normal_dmg_,
    charged_dmg_: set2_charged_dmg_,
    critRate_: set4_critRate_,
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        header: setHeader(2),
        fields: [{ node: set2_normal_dmg_ }, { node: set2_charged_dmg_ }],
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        path: condSet4Path,
        value: condSet4,
        name: st('hpChange'),
        states: objKeyMap(stacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: set4_critRate_,
            },
            {
              text: stg('duration'),
              value: 5,
              unit: 's',
            },
          ],
        })),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
