import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'LumidouceElegy'

const atk_arr = allStats.weapon.data[key].refinementBonus.atk_!

const dmg_arr = [-1, 0.18, 0.23, 0.28, 0.33, 0.38]
const stacksArr = range(1, 2)
const [condStacksPath, condStacks] = cond(key, 'stacks')

const atk_ = subscript(input.weapon.refinement, atk_arr)

const dmg_ = lookup(
  condStacks,
  objKeyMap(stacksArr, (stack) =>
    prod(subscript(input.weapon.refinement, dmg_arr, { unit: '%' }), stack),
  ),
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_: dmg_,
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      value: condStacks,
      path: condStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: dmg_,
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
}
export default new WeaponSheet(sheet, data)
