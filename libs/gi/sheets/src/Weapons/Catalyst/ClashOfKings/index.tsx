import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'ClashOfKings'

const atk_arr = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const eleMasArr = [-1, 100, 125, 150, 175, 200]

const [condSkillPath, condSkill] = cond(key, 'skill')
const skill_atk_ = equal(
  'on',
  condSkill,
  subscript(input.weapon.refinement, atk_arr)
)
const skill_eleMas = equal(
  'on',
  condSkill,
  subscript(input.weapon.refinement, eleMasArr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: skill_atk_,
    eleMas: skill_eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condSkill,
      path: condSkillPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: skill_atk_,
            },
            {
              node: skill_eleMas,
            },
            {
              text: stg('duration'),
              value: 6,
              unit: 's',
            },
            {
              text: stg('cd'),
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
