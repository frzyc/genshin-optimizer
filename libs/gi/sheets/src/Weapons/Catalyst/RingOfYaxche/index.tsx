import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, min, prod, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'RingOfYaxche'

const normal_dmg_arr = [-1, 0.006, 0.007, 0.008, 0.009, 0.01]
const max_normal_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_normal_dmg_ = equal(
  input.weapon.key,
  key,
  equal(
    condAfterSkill,
    'on',
    min(
      prod(
        subscript(input.weapon.refinement, normal_dmg_arr, { unit: '%' }),
        input.total.hp,
        1 / 1000
      ),
      subscript(input.weapon.refinement, max_normal_dmg_arr, { unit: '%' })
    )
  )
)

const data = dataObjForWeaponSheet(
  key,
  {
    premod: {
      normal_dmg_: afterSkill_normal_dmg_,
    },
  },
  {
    afterSkill_normal_dmg_,
  }
)

const sheet: IWeaponSheet = {
  document: [
    {
      value: condAfterSkill,
      path: condAfterSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: afterSkill_normal_dmg_,
            },
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
