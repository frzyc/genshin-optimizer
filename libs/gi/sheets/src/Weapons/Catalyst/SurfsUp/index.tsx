import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SurfsUp'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const hp_arr = data_gen.refinementBonus.hp_
if (!hp_arr)
  throw new Error(`data_gen.refinementBonus.hp_ for ${key} was undefined`)
const normal_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const hp_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, hp_arr),
)

const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 4)
const normal_dmg_ = lookup(
  condStacks,
  objKeyMap(stacksArr, (stack) =>
    prod(
      stack,
      subscript(input.weapon.refinement, normal_dmg_arr, { unit: '%' }),
    ),
  ),
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_,
    normal_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: hp_,
        },
      ],
    },
    {
      value: condStacks,
      path: condStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: normal_dmg_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
