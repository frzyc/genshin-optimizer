import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KitainCrossSpear"
const data_gen = data_gen_json as WeaponData

const skill_dmgInc = [0.06, 0.075, 0.09, 0.105, 0.12]
const skill_dmg_ = subscript(input.weapon.refineIndex, skill_dmgInc)
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: skill_dmg_,
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
