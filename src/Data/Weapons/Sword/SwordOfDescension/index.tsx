import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, percent, prod } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SwordOfDescension"
const data_gen = data_gen_json as WeaponData

const atk = equal("Traveler", input.charKey, 66)
const dmg_ = equal(input.weapon.key, key,
  customDmgNode(prod(percent(2), input.premod.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk
  }
}, {
  dmg_
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: atk
    }, {
      node: infoMut(dmg_, { key: "sheet:dmg" })
    }]
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
