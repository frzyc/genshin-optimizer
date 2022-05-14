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

const key: WeaponKey = "SharpshootersOath"
const data_gen = data_gen_json as WeaponData

const weakspotDMG_s = [.24, .30, .36, .42, .48]
const weakspotDMG_ = subscript(input.weapon.refineIndex, weakspotDMG_s)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    weakspotDMG_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: weakspotDMG_
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
