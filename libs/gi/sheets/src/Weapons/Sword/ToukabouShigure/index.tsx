import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'ToukabouShigure'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const all_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const all_dmg_ = equal(
  input.weapon.key,
  key,
  equal(
    condPassive,
    'on',
    subscript(input.weapon.refinement, all_dmg_arr, { unit: '%' }),
  ),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
