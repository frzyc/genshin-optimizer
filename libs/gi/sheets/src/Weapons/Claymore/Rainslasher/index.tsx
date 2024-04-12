import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Rainslasher'

const dmgInc = [-1, 0.2, 0.24, 0.28, 0.32, 0.36]
const [condPassivePath, condPassive] = cond(key, 'BaneOfStormAndTide')
const all_dmg_ = equal(
  'on',
  condPassive,
  subscript(input.weapon.refinement, dmgInc)
)
const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      name: st('enemyAffected.hydroOrElectro'),
      header: headerTemplate(key, st('conditional')),
      states: {
        on: {
          fields: [
            {
              node: all_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
