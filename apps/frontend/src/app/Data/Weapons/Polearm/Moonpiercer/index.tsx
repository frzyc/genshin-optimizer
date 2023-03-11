import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input, target } from '../../../../Formula'
import { equal, infoMut, subscript } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'Moonpiercer'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_arr = [0.16, 0.2, 0.24, 0.28, 0.32]
const atk_disp = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, atk_arr, { unit: '%' })
)
const atk_ = equal(input.activeCharKey, target.charKey, atk_disp)
const data = dataObjForWeaponSheet(key, data_gen, {
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
              node: infoMut(atk_disp, KeyMap.info('atk_')),
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
export default new WeaponSheet(key, sheet, data_gen, data)
