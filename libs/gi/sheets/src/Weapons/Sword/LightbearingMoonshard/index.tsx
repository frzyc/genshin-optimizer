import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'LightbearingMoonshard'

const def_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const def_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, def_arr)
)

const [condPassivePath, condPassive] = cond(key, 'passive')
const lunarcrystallize_dmg_arr = [-1, 0.64, 0.8, 0.96, 1.12, 1.28]
const lunarcrystallize_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, lunarcrystallize_dmg_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    def_,
    lunarcrystallize_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: def_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: lunarcrystallize_dmg_,
            },
            {
              text: stg('duration'),
              value: 5,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
