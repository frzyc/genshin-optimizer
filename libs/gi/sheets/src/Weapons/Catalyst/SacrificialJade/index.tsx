import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SacrificialJade'
const [, trm] = trans('weapon', key)

const hp_arr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]
const eleMasArr = [-1, 40, 50, 60, 70, 80]

const [condOffFieldPath, condOffField] = cond(key, 'offField')
const hp_ = equal(
  condOffField,
  'on',
  subscript(input.weapon.refinement, hp_arr),
)
const eleMas = equal(
  condOffField,
  'on',
  subscript(input.weapon.refinement, eleMasArr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
    hp_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      path: condOffFieldPath,
      value: condOffField,
      name: trm('condOffField'),
      states: {
        on: {
          fields: [
            {
              node: hp_,
            },
            {
              node: eleMas,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
