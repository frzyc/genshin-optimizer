import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'TwinNephrite'
const data_gen = allStats.weapon.data[key]

const refineInc = [0.12, 0.14, 0.16, 0.18, 0.2]

const [condPassivePath, condPassive] = cond(key, 'GuerillaTactics')
const atk_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, refineInc)
)
const moveSPD_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refineIndex, refineInc)
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
      name: st('afterDefeatEnemy'),
      header: headerTemplate(key, st('conditional')),
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
