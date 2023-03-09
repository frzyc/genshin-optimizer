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

const key: WeaponKey = 'ForestRegalia'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')
const eleMasArr = [60, 75, 90, 105, 120]
const eleMas_disp = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, eleMasArr)
)
const eleMas = equal(input.activeCharKey, target.charKey, eleMas_disp)

const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      eleMas,
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
              node: infoMut(eleMas_disp, KeyMap.info('eleMas')),
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
