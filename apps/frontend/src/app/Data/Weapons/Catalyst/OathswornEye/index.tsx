import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'OathswornEye'
const data_gen = allStats.weapon.data[key]

const refinementVals = [0.24, 0.3, 0.36, 0.42, 0.48]

const [condSkillBurstPath, condSkillBurst] = cond(key, 'faLight')
const refineVal = subscript(input.weapon.refineIndex, refinementVals)
const enerRech_ = equal('skillBurst', condSkillBurst, refineVal)

const data = dataObjForWeaponSheet(key, data_gen, {
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
export default new WeaponSheet(key, sheet, data_gen, data)
