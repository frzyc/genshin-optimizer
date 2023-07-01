import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'SkyriderSword'
const data_gen = allStats.weapon.data[key]

const [condPassivePath, condPassive] = cond(key, 'Determination')
const bonusInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, bonusInc, { unit: '%' })
)
const moveSPD_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refineIndex, bonusInc, { unit: '%' })
)

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
export default new WeaponSheet(key, sheet, data_gen, data)
