import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MitternachtsWaltz"
const [tr] = trans("weapon", key)
const data_gen = data_gen_json as WeaponData

const skill_dmg_s = [.20, .25, .30, .35, .40]
const normal_dmg_s = [.20, .25, .30, .35, .40]

const [condSkillPath, condSkill] = cond(key, "EvernightDuetSkill")
const [condNormalPath, condNormal] = cond(key, "EvernightDuetNormal")

const skill_dmg_ = equal(condSkill, "on", subscript(input.weapon.refineIndex, skill_dmg_s))
const normal_dmg_ = equal(condNormal, "on", subscript(input.weapon.refineIndex, normal_dmg_s))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    normal_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condNormal,
      path: condNormalPath,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: st("hitOp.skill"),
      states: {
        on: {
          fields: [{
            node: normal_dmg_
          }, {
            text: sgt("duration"),
            value: 5,
            unit: 's'
          }]
        }
      }
    }
  }, {
    conditional: {
      value: condSkill,
      path: condSkillPath,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: st("hitOp.normal"),
      states: {
        on: {
          fields: [{
            node: skill_dmg_
          }, {
            text: sgt("duration"),
            value: 5,
            unit: 's'
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)