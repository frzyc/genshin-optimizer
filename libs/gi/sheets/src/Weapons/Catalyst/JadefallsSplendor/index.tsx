import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { equal, input, min, prod, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'JadefallsSplendor'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'condPassive')
const ele_dmg_arr = [-1, 0.003, 0.005, 0.007, 0.009, 0.011]
const maxEle_dmg_arr = [-1, 0.12, 0.2, 0.28, 0.36, 0.44]
const ele_dmg_ = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    min(
      subscript(input.weapon.refinement, maxEle_dmg_arr, { unit: '%' }),
      prod(
        subscript(input.weapon.refinement, ele_dmg_arr, { unit: '%' }),
        // TODO: verify this... there is no way to atm. Pretty sure this is premod,
        // but lets leave it as total because it is prettier formatted
        input.total.hp,
        1 / 1000
      )
    )
  )
)
const ele_dmg_nodes = Object.fromEntries(
  allElementKeys.map((ele) => [
    `${ele}_dmg_`,
    equal(ele, input.charEle, ele_dmg_),
  ])
)

export const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      ...ele_dmg_nodes,
    },
  },
  {
    ...ele_dmg_nodes,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condPassivePath,
      value: condPassive,
      name: trm('condName'),
      states: {
        on: {
          fields: [
            ...Object.values(ele_dmg_nodes).map((node) => ({ node })),
            {
              text: stg('duration'),
              value: 3,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
