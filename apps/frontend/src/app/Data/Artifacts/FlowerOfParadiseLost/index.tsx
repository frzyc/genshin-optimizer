import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  greaterEq,
  lookup,
  naught,
  percent,
  prod,
  sum,
} from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { range } from '../../../Util/Util'
import { cond, st, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'FlowerOfParadiseLost'
const [, trm] = trans('artifact', key)
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.FlowerOfParadiseLost, 2, 80)

const base_bloom_dmg_ = greaterEq(
  input.artSet.FlowerOfParadiseLost,
  4,
  percent(0.4),
  KeyMap.info('bloom_dmg_')
)
const base_hyperbloom_dmg_ = {
  ...base_bloom_dmg_,
  info: KeyMap.info('hyperbloom_dmg_'),
}
const base_burgeon_dmg_ = {
  ...base_bloom_dmg_,
  info: KeyMap.info('burgeon_dmg_'),
}

const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 4)
const stack_bloom_dmg_ = greaterEq(
  input.artSet.FlowerOfParadiseLost,
  4,
  lookup(
    condStacks,
    Object.fromEntries(
      stacksArr.map((stack) => [stack, prod(stack, percent(0.1))])
    ),
    naught,
    KeyMap.info('bloom_dmg_')
  )
)
const stack_hyperbloom_dmg_ = {
  ...stack_bloom_dmg_,
  info: KeyMap.info('hyperbloom_dmg_'),
}
const stack_burgeon_dmg_ = {
  ...stack_bloom_dmg_,
  info: KeyMap.info('burgeon_dmg_'),
}

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
    bloom_dmg_: sum(base_bloom_dmg_, stack_bloom_dmg_),
    hyperbloom_dmg_: sum(base_hyperbloom_dmg_, stack_hyperbloom_dmg_),
    burgeon_dmg_: sum(base_burgeon_dmg_, stack_burgeon_dmg_),
  },
})

const sheet: IArtifactSheet = {
  name: 'Flower of Paradise Lost',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          fields: [
            {
              node: base_bloom_dmg_,
            },
            {
              node: base_hyperbloom_dmg_,
            },
            {
              node: base_burgeon_dmg_,
            },
          ],
        },
        {
          header: setHeader(4),
          path: condStacksPath,
          value: condStacks,
          name: trm('condName'),
          states: Object.fromEntries(
            stacksArr.map((stack) => [
              stack,
              {
                name: st('stack', { count: stack }),
                fields: [
                  {
                    node: stack_bloom_dmg_,
                  },
                  {
                    node: stack_hyperbloom_dmg_,
                  },
                  {
                    node: stack_burgeon_dmg_,
                  },
                  {
                    text: stg('duration'),
                    value: 10,
                    unit: 's',
                  },
                ],
              },
            ])
          ),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
