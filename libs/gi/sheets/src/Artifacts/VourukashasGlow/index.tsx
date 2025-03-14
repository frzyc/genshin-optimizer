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
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'VourukashasGlow'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.VourukashasGlow, 2, 0.2)

const set4_skill_dmg_ = greaterEq(input.artSet.VourukashasGlow, 4, 0.1, {
  path: 'skill_dmg_',
})
const set4_burst_dmg_ = greaterEq(input.artSet.VourukashasGlow, 4, 0.1, {
  path: 'burst_dmg_',
})

const [condSet4Path, condSet4] = cond(key, 'set4')
const stacksArr = range(1, 5)
const set4_stacks_skill_dmg_ = greaterEq(
  input.artSet.VourukashasGlow,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(stack * 0.08)),
    naught,
  ),
  { path: 'skill_dmg_' },
)
const set4_stacks_burst_dmg_ = greaterEq(
  input.artSet.VourukashasGlow,
  4,
  lookup(
    condSet4,
    objKeyMap(stacksArr, (stack) => constant(stack * 0.08)),
    naught,
  ),
  { path: 'burst_dmg_' },
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hp_: set2,
    skill_dmg_: sum(set4_skill_dmg_, set4_stacks_skill_dmg_),
    burst_dmg_: sum(set4_burst_dmg_, set4_stacks_burst_dmg_),
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: [
          {
            node: set4_skill_dmg_,
          },
          {
            node: set4_burst_dmg_,
          },
        ],
      },
      {
        header: setHeader(4),
        path: condSet4Path,
        value: condSet4,
        name: st('takeDmg'),
        states: objKeyMap(stacksArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: set4_stacks_skill_dmg_,
            },
            {
              node: set4_stacks_burst_dmg_,
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
