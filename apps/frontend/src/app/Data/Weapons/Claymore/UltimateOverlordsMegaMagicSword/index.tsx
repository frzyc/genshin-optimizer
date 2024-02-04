import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  equal,
  lookup,
  naught,
  prod,
  subscript,
  sum,
} from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'UltimateOverlordsMegaMagicSword'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const atk_arr = data_gen.refinementBonus.atk_
const atk2_arr = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]

const atk_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, atk_arr),
  KeyMap.info('atk_')
)

const [condMelusinesPath, condMelusines] = cond(key, 'melusines')
// TODO: Verify this number
const melusinesArr = range(1, 12)
const atk_2 = lookup(
  condMelusines,
  objKeyMap(melusinesArr, (stack) =>
    prod(stack, subscript(input.weapon.refinement, atk2_arr, { unit: '%' }))
  ),
  naught,
  KeyMap.info('atk_')
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_: sum(atk_, atk_2),
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
      value: condMelusines,
      path: condMelusinesPath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(melusinesArr, (melusines) => ({
        name: `${melusines}`,
        fields: [
          {
            node: atk_2,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
