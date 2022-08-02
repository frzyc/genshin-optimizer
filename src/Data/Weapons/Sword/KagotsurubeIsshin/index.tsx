import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, percent, prod } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KagotsurubeIsshin"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "passive")
const atk_ = equal(condPassive, "on", percent(0.15)) // No refinement data
const dmg = equal(input.weapon.key, key,
  equal(condPassive, "on", customDmgNode(prod(percent(1.8), input.total.atk), "elemental", { hit: { ele: constant("physical") } })))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  }
}, {
  dmg
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    value: condPassive,
    path: condPassivePath,
    name: st("hitOp.normalChargedOrPlunging"),
    states: {
      on: {
        fields: [{
          node: infoMut(dmg, { key: "sheet:dmg" })
        }, {
          node: atk_
        }, {
          text: sgt("duration"),
          value: 8,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: 8,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
