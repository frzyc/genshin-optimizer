import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'RavenBow'

const all_dmg_s = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const [condPassivePath, condPassive] = cond(key, 'BaneOfFlameAndWater')
const all_dmg_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, all_dmg_s)
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
      name: st('enemyAffected.hydroOrPyro'),
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
