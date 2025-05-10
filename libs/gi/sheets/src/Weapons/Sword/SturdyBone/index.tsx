import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, prod, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SturdyBone'

const normal_dmgInc_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const [condAfterSprintPath, condAfterSprint] = cond(key, 'afterSprint')
const normal_dmgInc = equal(
  condAfterSprint,
  'on',
  prod(
    subscript(input.weapon.refinement, normal_dmgInc_arr, { unit: '%' }),
    input.total.atk
  )
)

const dmg = equal(input.weapon.key, key, normal_dmgInc)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      normal_dmgInc,
    },
  },
  { dmg }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('conditional')),
      value: condAfterSprint,
      path: condAfterSprintPath,
      name: st('afterUse.sprint'),
      states: {
        on: {
          fields: [
            {
              node: normal_dmgInc,
            },
            {
              text: st('triggerQuota'),
              value: 18,
            },
            {
              text: stg('duration'),
              value: 7,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
