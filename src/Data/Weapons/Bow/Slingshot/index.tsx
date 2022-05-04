import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, percent, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Slingshot"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const normal_atk_increase_s = [.46, .52, .58, .64, .70] // Increased by 10% to counteract the decrease
const charged_atk_increase_s = [.46, .52, .58, .64, .70]

const [condPassivePath, condPassive] = cond(key, "Slingshot")
const normal_atk_increase = equal(condPassive, "on", subscript(input.weapon.refineIndex, normal_atk_increase_s), { key: "normal_dmg_" })
const charged_atk_increase = equal(condPassive, "on", subscript(input.weapon.refineIndex, charged_atk_increase_s), { key: "charged_dmg_" })
const normal_atk_decrease = percent(-0.1, { key: "normal_dmg_" })
const charged_atk_decrease = percent(-0.1, { key: "charged_dmg_" })

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_: sum(normal_atk_increase, normal_atk_decrease),
    charged_dmg_: sum(charged_atk_increase, normal_atk_decrease)
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: normal_atk_decrease
    }, {
      node: charged_atk_decrease
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: normal_atk_increase
        }, {
          node: charged_atk_increase
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
