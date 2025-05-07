import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum, unequal } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SymphonistOfScents'

const atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const offField_atk_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const team_atk_arr = [-1, 0.32, 0.4, 0.48, 0.56, 0.64]

const atk_ = subscript(input.weapon.refinement, atk_arr, { path: 'atk_' })
const offField_atk_ = unequal(
  input.charKey,
  input.activeCharKey,
  subscript(input.weapon.refinement, offField_atk_arr, { path: 'atk_' })
)

const [condHealingPath, condHealing] = cond(key, 'healing')
const healing_atk_ = equal(
  condHealing,
  'on',
  subscript(input.weapon.refinement, team_atk_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: sum(atk_, offField_atk_),
  },
  teamBuff: { premod: { atk_: healing_atk_ } },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
        {
          node: offField_atk_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('conditional')),
      path: condHealingPath,
      value: condHealing,
      teamBuff: true,
      name: st('afterPerformHeal'),
      states: {
        on: {
          fields: [
            {
              node: healing_atk_,
            },
            {
              text: stg('duration'),
              value: 3,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
