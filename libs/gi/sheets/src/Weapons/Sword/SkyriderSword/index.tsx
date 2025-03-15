import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SkyriderSword'

const [condPassivePath, condPassive] = cond(key, 'Determination')
const bonusInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, bonusInc, { unit: '%' }),
)
const moveSPD_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, bonusInc, { unit: '%' }),
)

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
      name: st('afterUse.burst'),
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
