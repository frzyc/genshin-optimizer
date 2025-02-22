import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FruitfulHook'

const plunging_critRate_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const plunging_critRate_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, plunging_critRate_arr, { unit: '%' })
)

const [condAfterPlungingPath, condAfterPlunging] = cond(key, 'afterPlunging')
const dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const normal_dmg_ = equal(
  condAfterPlunging,
  'on',
  subscript(input.weapon.refinement, dmg_arr, { unit: '%' })
)
const charged_dmg_ = { ...normal_dmg_ }
const plunging_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    plunging_critRate_,
    normal_dmg_,
    charged_dmg_,
    plunging_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: plunging_critRate_,
        },
      ],
    },
    {
      value: condAfterPlunging,
      path: condAfterPlungingPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.plunging'),
      states: {
        on: {
          fields: [
            ...[normal_dmg_, charged_dmg_, plunging_dmg_].map((node) => ({
              node,
            })),
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
