import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TwinNephrite'

const refineInc = [-1, 0.12, 0.14, 0.16, 0.18, 0.2]

const [condPassivePath, condPassive] = cond(key, 'GuerillaTactics')
const atk_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, refineInc),
)
const moveSPD_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, refineInc),
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
export default new WeaponSheet(sheet, data)
