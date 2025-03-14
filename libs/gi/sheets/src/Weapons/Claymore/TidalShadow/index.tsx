import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TidalShadow'

const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condAfterHealPath, condAfterHeal] = cond(key, 'afterHeal')
const atk_ = equal(
  condAfterHeal,
  'on',
  subscript(input.weapon.refinement, atk_arr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      path: condAfterHealPath,
      value: condAfterHeal,
      name: st('afterHeal'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
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
export default new WeaponSheet(sheet, data)
