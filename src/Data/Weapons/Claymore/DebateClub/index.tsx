import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "DebateClub"
const data_gen = data_gen_json as WeaponData

const dmgPerc = [0.6, 0.75, 0.9, 1.05, 1.2]
const dmg = customDmgNode(prod(subscript(input.weapon.refineIndex, dmgPerc, { key: "_" }), input.total.atk), "elemental", {
  hit: { ele: constant("physical") }
})
const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmg, { key: "sheet:dmg" }),
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
