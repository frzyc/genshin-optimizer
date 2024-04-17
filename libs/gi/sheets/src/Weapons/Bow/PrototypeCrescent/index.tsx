import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, percent, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PrototypeCrescent'

const atk_s = [-1, 0.36, 0.45, 0.54, 0.63, 0.72]
const [condPassivePath, condPassive] = cond(key, 'Unreturning')
const atk_ = equal(condPassive, 'on', subscript(input.weapon.refinement, atk_s))
const moveSPD_ = equal(condPassive, 'on', percent(0.1))

const data = dataObjForWeaponSheet(key, {
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
export default new WeaponSheet(sheet, data)
