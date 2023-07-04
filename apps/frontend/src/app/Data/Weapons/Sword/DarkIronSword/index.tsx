import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'DarkIronSword'
const data_gen = allStats.weapon.data[key]

const atkInc = [-1, 0.2, 0.25, 0.3, 0.35, 0.5]
const [condPassivePath, condPassive] = cond(key, 'Overloaded')
const atk_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, atkInc, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, data_gen, {
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
export default new WeaponSheet(key, sheet, data_gen, data)
