import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MountainBracingBolt'

const skill_dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const skill_dmg_ = equal(
  input.weapon.key,
  key,
  subscript(input.weapon.refinement, skill_dmg_arr, {
    path: 'skill_dmg_',
    unit: '%',
  })
)

const [condAfterOtherSkillPath, condAfterOtherSkill] = cond(
  key,
  'afterOtherSkill'
)
const dmg_arr = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const skill_dmg_2 = equal(
  condAfterOtherSkill,
  'on',
  subscript(input.weapon.refinement, dmg_arr, { path: 'skill_dmg_', unit: '%' })
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_: sum(skill_dmg_, skill_dmg_2),
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: skill_dmg_,
        },
      ],
    },
    {
      value: condAfterOtherSkill,
      path: condAfterOtherSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('otherTeamAfterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: skill_dmg_2,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
