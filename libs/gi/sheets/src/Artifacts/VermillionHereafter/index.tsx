import { range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  greaterEq,
  input,
  lookup,
  naught,
  percent,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'VermillionHereafter'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.VermillionHereafter, 2, percent(0.18), {
  path: 'atk_',
})
const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurstAtk_ = greaterEq(
  input.artSet.VermillionHereafter,
  4,
  equal(condAfterBurst, 'on', percent(0.08)),
  { path: 'atk_' },
)
const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksAtk_ = greaterEq(
  input.artSet.VermillionHereafter,
  4,
  equal(
    condAfterBurst,
    'on',
    lookup(
      condStacks,
      Object.fromEntries(
        range(1, 4).map((stacks) => [stacks, percent(0.1 * stacks)]),
      ),
      naught,
    ),
    { path: 'atk_' },
  ),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: sum(set2, afterBurstAtk_, stacksAtk_),
  },
})
const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: condAfterBurst,
        path: condAfterBurstPath,
        teamBuff: true,
        name: st('afterUse.burst'),
        states: {
          on: {
            fields: [{ node: afterBurstAtk_ }],
          },
        },
      },
      {
        header: setHeader(4),
        value: condStacks,
        path: condStacksPath,
        teamBuff: true,
        name: st('stacks'),
        canShow: equal(condAfterBurst, 'on', 1),
        states: Object.fromEntries(
          range(1, 4).map((stacks) => [
            stacks,
            {
              name: st('stack', { count: stacks }),
              fields: [{ node: stacksAtk_ }],
            },
          ]),
        ),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
