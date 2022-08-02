import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "FilletBlade"
const data_gen = data_gen_json as WeaponData

const dmg_Src = [2.4, 2.8, 3.2, 3.6, 4]
const cd_Src = [15, 14, 13, 12, 11]
const dmg_ = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { key: "_" }), input.premod.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg_
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmg_, { key: "sheet:dmg" })
    }, {
      text: sgt("cd"),
      value: (data) => cd_Src[data.get(input.weapon.refineIndex).value],
      unit: "s"
    }]
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
