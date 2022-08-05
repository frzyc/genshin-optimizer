import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TheBlackSword"
const data_gen = data_gen_json as WeaponData

const autoSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const hpRegenSrc = [0.6, 0.7, 0.8, 0.9, 1]
const normal_dmg_ = subscript(input.weapon.refineIndex, autoSrc)
const charged_dmg_ = subscript(input.weapon.refineIndex, autoSrc)
const heal = equal(input.weapon.key, key,
  customHealNode(prod(subscript(input.weapon.refineIndex, hpRegenSrc, { key: "_" }), input.total.atk)))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_
  }
}, { heal })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: normal_dmg_
    }, {
      node: charged_dmg_
    }, {
      node: infoMut(heal, { key: "sheet_gen:healing" })
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
