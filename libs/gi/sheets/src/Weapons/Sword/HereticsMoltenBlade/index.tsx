import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  prod,
  subscript,
  sum,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'HereticsMoltenBlade'

const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveRange = range(0, 18)
const atk_arr = [-1, 0.18, 0.225, 0.27, 0.315, 0.36]
const addl_atk_arr = [-1, 0.01, 0.0125, 0.015, 0.0175, 0.02]
const atk_ = unequal(
  condPassive,
  undefined,
  sum(
    lookup(
      condPassive,
      objKeyMap(passiveRange, (i) =>
        prod(i, subscript(input.weapon.refinement, addl_atk_arr, { unit: '%' }))
      ),
      0
    ),
    subscript(input.weapon.refinement, atk_arr, { unit: '%' })
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: atk_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(passiveRange, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: atk_,
          },
          {
            text: stg('duration'),
            value: 14,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 14,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
