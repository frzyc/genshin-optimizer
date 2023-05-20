import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'SolarPearl'
const data_gen = allStats.weapon.data[key]

const refinementVals = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condNormalPath, condNormal] = cond(key, 'solarShineNormal')
const [condSkillBurstPath, condSkillBurst] = cond(key, 'solarShineSkillBurst')
const refineVal = subscript(input.weapon.refineIndex, refinementVals)
const skill_dmg_ = equal('normal', condNormal, refineVal)
const burst_dmg_ = { ...skill_dmg_ }
const normal_dmg_ = equal('skillBurst', condSkillBurst, refineVal)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_,
    normal_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condNormal,
      path: condNormalPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.normal'),
      states: {
        normal: {
          fields: [
            {
              node: skill_dmg_,
            },
            {
              node: burst_dmg_,
            },
          ],
        },
      },
    },
    {
      value: condSkillBurst,
      path: condSkillBurstPath,
      header: headerTemplate(key, st('conditional')),
      name: st('hitOp.skillOrBurst'),
      states: {
        skillBurst: {
          fields: [
            {
              node: normal_dmg_,
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
