import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  subscript,
  target,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Moonpiercer'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atk_disp = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, atk_arr, { unit: '%' })
)
const atk_ = equal(input.activeCharKey, target.charKey, atk_disp)
const data = dataObjForWeaponSheet(key, {
  teamBuff: {
    premod: {
      atk_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(atk_disp, { path: 'atk_' }),
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 20,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
