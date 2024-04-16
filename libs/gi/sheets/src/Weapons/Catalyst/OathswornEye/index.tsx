import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { equal, input, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'OathswornEye'

const refinementVals = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condSkillBurstPath, condSkillBurst] = cond(key, 'faLight')
const refineVal = subscript(input.weapon.refinement, refinementVals)
const enerRech_ = equal('skillBurst', condSkillBurst, refineVal)

const data = dataObjForWeaponSheet(key, {
  premod: {
    enerRech_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condSkillBurst,
      path: condSkillBurstPath,
      header: headerTemplate(key, st('conditional')),
      name: st('afterUse.skill'),
      states: {
        skillBurst: {
          fields: [
            {
              node: enerRech_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
