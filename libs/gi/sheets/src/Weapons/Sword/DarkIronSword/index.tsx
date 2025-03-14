import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'DarkIronSword'

const atkInc = [-1, 0.2, 0.25, 0.3, 0.35, 0.5]
const [condPassivePath, condPassive] = cond(key, 'Overloaded')
const atk_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atkInc, { unit: '%' }),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('elementalReaction.electro'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
