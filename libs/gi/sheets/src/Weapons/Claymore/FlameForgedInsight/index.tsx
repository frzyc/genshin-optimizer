import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FlameForgedInsight'
const [, trm] = trans('weapon', key)

const [condPassivePath, condPassive] = cond(key, 'passive')

const eleMasArr = [-1, 60, 75, 90, 105, 120]

const eleMas = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, eleMasArr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('cond'),
      states: {
        on: {
          fields: [
            {
              node: eleMas,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
            {
              text: stg('cd'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
