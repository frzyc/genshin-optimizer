import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MailedFlower'
const data_gen = allStats.weapon.data[key]

const [, trm] = trans('weapon', key)

const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const eleMasArr = [-1, 48, 60, 72, 84, 96]
const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, atk_arr, { unit: '%' })
)
const eleMas = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, eleMasArr)
)
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    eleMas,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: trm('condName'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
