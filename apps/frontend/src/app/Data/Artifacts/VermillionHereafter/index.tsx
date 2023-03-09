import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  equal,
  greaterEq,
  lookup,
  naught,
  percent,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'VermillionHereafter'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(
  input.artSet.VermillionHereafter,
  2,
  percent(0.18),
  KeyMap.info('atk_')
)
const [condAfterBurstPath, condAfterBurst] = cond(key, 'afterBurst')
const afterBurstAtk_ = greaterEq(
  input.artSet.VermillionHereafter,
  4,
  equal(condAfterBurst, 'on', percent(0.08)),
  KeyMap.info('atk_')
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
        range(1, 4).map((stacks) => [stacks, percent(0.1 * stacks)])
      ),
      naught
    ),
    KeyMap.info('atk_')
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: sum(set2, afterBurstAtk_, stacksAtk_),
  },
})
const sheet: IArtifactSheet = {
  name: 'Vermillion Hereafter',
  rarity: [4, 5],
  setEffects: {
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
            ])
          ),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
