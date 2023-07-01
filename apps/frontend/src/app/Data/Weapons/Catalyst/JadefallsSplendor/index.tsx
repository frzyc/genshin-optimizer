import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, min, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'JadefallsSplendor'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'condPassive')
const ele_dmg_arr = [0.003, 0.005, 0.007, 0.009, 0.011]
const maxEle_dmg_arr = [0.12, 0.2, 0.28, 0.36, 0.44]
const ele_dmg_ = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    min(
      subscript(input.weapon.refineIndex, maxEle_dmg_arr, { unit: '%' }),
      prod(
        subscript(input.weapon.refineIndex, ele_dmg_arr, { unit: '%' }),
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
  data_gen,
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
export default new WeaponSheet(key, sheet, data_gen, data)
