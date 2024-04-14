import { range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FruitOfFulfillment'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const eleMasArr = [-1, 24, 27, 30, 33, 36]
const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 5)
const eleMas = lookup(
  condStacks,
  Object.fromEntries(
    stacksArr.map((stacks) => [
      stacks,
      prod(subscript(input.weapon.refinement, eleMasArr), stacks),
    ])
  ),
  naught
)

const atk_ = lookup(
  condStacks,
  Object.fromEntries(
    stacksArr.map((stacks) => [stacks, prod(percent(-0.05), stacks)])
  ),
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      path: condStacksPath,
      value: condStacks,
      name: trm('stackName'),
      states: Object.fromEntries(
        stacksArr.map((stack) => [
          stack,
          {
            name: st('stack', { count: stack }),
            fields: [
              {
                node: eleMas,
              },
              {
                node: atk_,
              },
            ],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
