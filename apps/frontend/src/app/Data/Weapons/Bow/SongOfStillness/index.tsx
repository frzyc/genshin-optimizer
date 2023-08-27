import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SongOfStillness'
const data_gen = allStats.weapon.data[key]

const dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const [condAfterHealPath, condAfterHeal] = cond(key, 'afterHeal')
const all_dmg_ = equal(
  condAfterHeal,
  'on',
  subscript(input.weapon.refinement, dmg_arr)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
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
              node: all_dmg_,
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
