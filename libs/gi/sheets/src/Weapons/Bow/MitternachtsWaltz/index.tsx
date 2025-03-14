import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MitternachtsWaltz'

const skill_dmg_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const normal_dmg_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const [condSkillPath, condSkill] = cond(key, 'EvernightDuetSkill')
const [condNormalPath, condNormal] = cond(key, 'EvernightDuetNormal')

const skill_dmg_ = equal(
  condSkill,
  'on',
  subscript(input.weapon.refinement, skill_dmg_s),
)
const normal_dmg_ = equal(
  condNormal,
  'on',
  subscript(input.weapon.refinement, normal_dmg_s),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_,
    normal_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condNormal,
      path: condNormalPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.skill'),
      states: {
        on: {
          fields: [
            {
              node: normal_dmg_,
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
    {
      value: condSkill,
      path: condSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.normal'),
      states: {
        on: {
          fields: [
            {
              node: skill_dmg_,
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
