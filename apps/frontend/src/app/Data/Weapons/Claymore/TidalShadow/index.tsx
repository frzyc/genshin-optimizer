import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TidalShadow'
const data_gen = allStats.weapon.data[key]

const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condAfterHealPath, condAfterHeal] = cond(key, 'afterHeal')
const atk_ = equal(
  condAfterHeal,
  'on',
  subscript(input.weapon.refinement, atk_arr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
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
export default new WeaponSheet(key, sheet, data_gen, data)
