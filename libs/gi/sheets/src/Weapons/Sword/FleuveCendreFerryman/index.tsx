import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FleuveCendreFerryman'

const skill_critRate_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const enerRech_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]

const skill_critRate_ = subscript(input.weapon.refinement, skill_critRate_arr)

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const enerRech_ = equal(
  condAfterSkill,
  'on',
  subscript(input.weapon.refinement, enerRech_arr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_critRate_,
    enerRech_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: skill_critRate_ }],
    },
    {
      header: headerTemplate(key, st('conditional')),
      value: condAfterSkill,
      path: condAfterSkillPath,
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: enerRech_,
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
