import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Rust"
const data_gen = data_gen_json as WeaponData

const normal_dmg_s = [.4, .5, .6, .7, .8]

const normal_dmg_ = subscript(input.weapon.refineIndex, normal_dmg_s)
const charged_dmg_ = constant(-0.1)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: normal_dmg_
    }, {
      node: charged_dmg_
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
