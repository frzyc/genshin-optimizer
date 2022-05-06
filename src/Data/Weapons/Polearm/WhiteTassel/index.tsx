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

const key: WeaponKey = "WhiteTassel"
const data_gen = data_gen_json as WeaponData

const dmgInc = [0.24, 0.30, 0.36, 0.42, 0.48]
const normal_dmg_ = subscript(input.weapon.refineIndex, dmgInc)
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: normal_dmg_,
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
