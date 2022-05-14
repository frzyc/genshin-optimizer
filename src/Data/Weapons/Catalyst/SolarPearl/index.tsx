import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SolarPearl"
const data_gen = data_gen_json as WeaponData

const refinementVals = [0.20, 0.25, 0.30, 0.35, 0.40]

const [condNormalPath, condNormal] = cond(key, "solarShineNormal")
const [condSkillBurstPath, condSkillBurst] = cond(key, "solarShineSkillBurst")
const refineVal = subscript(input.weapon.refineIndex, refinementVals)
const skill_dmg_ = equal("normal", condNormal, refineVal)
const burst_dmg_ = { ...skill_dmg_ }
const normal_dmg_ = equal("skillBurst", condSkillBurst, refineVal)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_,
    normal_dmg_,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condNormal,
    path: condNormalPath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("hitOp.normal"),
    states: {
      normal: {
        fields: [{
          node: skill_dmg_
        }, {
          node: burst_dmg_
        }]
      }
    }
  }, {
    value: condSkillBurst,
    path: condSkillBurstPath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("hitOp.skillOrBurst"),
    states: {
      skillBurst: {
        fields: [{
          node: normal_dmg_
        }]
      },
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
