import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { equal, percent, subscript } from '../../../../Formula/utils'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'PrototypeCrescent'
const data_gen = allStats.weapon.data[key]

const atk_s = [-1, 0.36, 0.45, 0.54, 0.63, 0.72]
const [condPassivePath, condPassive] = cond(key, 'Unreturning')
const atk_ = equal(condPassive, 'on', subscript(input.weapon.refinement, atk_s))
const moveSPD_ = equal(condPassive, 'on', percent(0.1))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    moveSPD_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.weakSpot'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              node: moveSPD_,
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
export default new WeaponSheet(key, sheet, data_gen, data)
