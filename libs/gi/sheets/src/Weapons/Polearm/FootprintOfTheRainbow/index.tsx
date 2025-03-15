import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FootprintOfTheRainbow'

const def_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_def_ = equal(
  condAfterSkill,
  'on',
  subscript(input.weapon.refinement, def_arr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    def_: afterSkill_def_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condAfterSkill,
      path: condAfterSkillPath,
      header: headerTemplate(key, st('cond')),
      name: st('afterUse.skill'),
      states: {
        on: {
          fields: [
            {
              node: afterSkill_def_,
            },
            {
              text: stg('duration'),
              value: 15,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
